import { useState, useEffect, useCallback } from “react”;

// ─── INITIAL DATA ───────────────────────────────────────────────────────────

const INITIAL_MARKETS = [
{ id: 1, category: “STOCK”, ticker: “NVDA”, question: “Will NVDA close above $145 by end of Q1 2026?”, yesProb: 0.68, volume: 892000, expiry: “Mar 31, 2026”, resolved: false, result: null },
{ id: 2, category: “MACRO”, ticker: “FED”, question: “Will the Fed cut rates at the March 2026 FOMC meeting?”, yesProb: 0.41, volume: 2100000, expiry: “Mar 19, 2026”, resolved: false, result: null },
{ id: 3, category: “EARNINGS”, ticker: “TSLA”, question: “Will TSLA report positive EPS in Q1 2026 earnings?”, yesProb: 0.54, volume: 456000, expiry: “Apr 22, 2026”, resolved: false, result: null },
{ id: 4, category: “STOCK”, ticker: “AAPL”, question: “Will AAPL close above $250 before end of 2026?”, yesProb: 0.72, volume: 1300000, expiry: “Dec 31, 2026”, resolved: false, result: null },
{ id: 5, category: “CRYPTO”, ticker: “BTC”, question: “Will Bitcoin hit $120,000 at any point in Q2 2026?”, yesProb: 0.38, volume: 3400000, expiry: “Jun 30, 2026”, resolved: false, result: null },
{ id: 6, category: “MACRO”, ticker: “ECON”, question: “Will the US enter a technical recession in H1 2026?”, yesProb: 0.27, volume: 780000, expiry: “Jun 30, 2026”, resolved: false, result: null },
{ id: 7, category: “EARNINGS”, ticker: “META”, question: “Will META beat Q1 2026 revenue estimates?”, yesProb: 0.61, volume: 540000, expiry: “Apr 29, 2026”, resolved: false, result: null },
{ id: 8, category: “STOCK”, ticker: “MSFT”, question: “Will MSFT hit $500 before Q3 2026?”, yesProb: 0.49, volume: 670000, expiry: “Sep 30, 2026”, resolved: false, result: null },
{ id: 9, category: “IPO”, ticker: “IPO”, question: “Will there be a major tech IPO (>$10B valuation) in Q2 2026?”, yesProb: 0.55, volume: 320000, expiry: “Jun 30, 2026”, resolved: false, result: null },
];

const CATEGORY_COLORS = {
STOCK: “#00D4FF”,
MACRO: “#F59E0B”,
EARNINGS: “#10B981”,
CRYPTO: “#F7931A”,
IPO: “#A78BFA”,
};

const formatMoney = (n) => {
if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
return `$${n.toFixed(2)}`;
};

const formatCurrency = (n) => `$${n.toFixed(2)}`;

// ─── STYLES ─────────────────────────────────────────────────────────────────

const css = `
@import url(‘https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@300;400;600;700&family=Barlow:wght@300;400;500&family=JetBrains+Mono:wght@400;500&display=swap’);

- { margin: 0; padding: 0; box-sizing: border-box; }

:root {
–black: #080A0E;
–deep: #0D1117;
–surface: #131820;
–border: #1E2730;
–muted: #2A3441;
–text-dim: #4A5A6B;
–text-mid: #8A9BAD;
–text: #C8D6E5;
–white: #F0F6FF;
–accent: #00D4FF;
–green: #10B981;
–red: #EF4444;
–gold: #F59E0B;
}

body { background: var(–black); color: var(–text); font-family: ‘Barlow’, sans-serif; font-weight: 300; overflow-x: hidden; }

.app { display: flex; flex-direction: column; min-height: 100vh; }

/* NAV */
.nav { position: sticky; top: 0; z-index: 100; height: 56px; background: rgba(8,10,14,0.95); backdrop-filter: blur(16px); border-bottom: 1px solid var(–border); display: flex; align-items: center; justify-content: space-between; padding: 0 24px; }
.nav-logo { font-family: ‘Bebas Neue’, sans-serif; font-size: 20px; letter-spacing: 0.1em; color: var(–white); display: flex; align-items: center; gap: 8px; cursor: pointer; }
.nav-logo span { color: var(–accent); }
.nav-tabs { display: flex; gap: 4px; }
.nav-tab { font-family: ‘Barlow Condensed’, sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; padding: 6px 14px; border: none; background: none; color: var(–text-dim); cursor: pointer; transition: all 0.15s; border-radius: 2px; }
.nav-tab:hover { color: var(–text); }
.nav-tab.active { background: rgba(0,212,255,0.1); color: var(–accent); }
.nav-right { display: flex; align-items: center; gap: 12px; }
.balance-display { font-family: ‘JetBrains Mono’, monospace; font-size: 12px; color: var(–text-mid); background: var(–surface); border: 1px solid var(–border); padding: 6px 12px; }
.balance-display strong { color: var(–green); }
.btn { font-family: ‘Barlow Condensed’, sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; border: none; padding: 7px 16px; cursor: pointer; transition: all 0.2s; }
.btn-accent { background: var(–accent); color: var(–black); clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%); }
.btn-accent:hover { background: var(–white); }
.btn-ghost { background: none; border: 1px solid var(–border); color: var(–text-mid); }
.btn-ghost:hover { border-color: var(–text-mid); color: var(–text); }
.btn-green { background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.4); color: var(–green); }
.btn-green:hover { background: rgba(16,185,129,0.25); }
.btn-red { background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.4); color: var(–red); }
.btn-red:hover { background: rgba(239,68,68,0.25); }
.btn-sm { padding: 5px 10px; font-size: 11px; }
.btn-lg { padding: 12px 28px; font-size: 14px; }
.btn-full { width: 100%; text-align: center; }

/* LAYOUT */
.page { flex: 1; padding: 24px; max-width: 1200px; margin: 0 auto; width: 100%; }
.page-wide { flex: 1; padding: 24px; width: 100%; }

/* MARKETS PAGE */
.markets-header { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
.page-title { font-family: ‘Bebas Neue’, sans-serif; font-size: 36px; color: var(–white); letter-spacing: 0.04em; line-height: 1; }
.page-subtitle { font-family: ‘Barlow Condensed’, sans-serif; font-size: 13px; color: var(–text-dim); letter-spacing: 0.1em; text-transform: uppercase; margin-top: 4px; }
.filters { display: flex; gap: 6px; flex-wrap: wrap; }
.filter-btn { font-family: ‘Barlow Condensed’, sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; background: none; border: 1px solid var(–border); color: var(–text-dim); padding: 5px 12px; cursor: pointer; transition: all 0.15s; }
.filter-btn.active, .filter-btn:hover { color: var(–accent); border-color: var(–accent); background: rgba(0,212,255,0.05); }

/* MARKET GRID */
.markets-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1px; background: var(–border); border: 1px solid var(–border); }
.market-card { background: var(–deep); padding: 20px; cursor: pointer; transition: background 0.15s; position: relative; overflow: hidden; }
.market-card:hover { background: var(–surface); }
.market-card::after { content: ‘’; position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, var(–accent), transparent); opacity: 0; transition: opacity 0.3s; }
.market-card:hover::after { opacity: 1; }
.card-tag { font-family: ‘JetBrains Mono’, monospace; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: var(–text-dim); margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }
.tag-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
.card-question { font-size: 14px; color: var(–text); line-height: 1.45; margin-bottom: 16px; min-height: 42px; }
.prob-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.prob-yes { font-family: ‘Bebas Neue’, sans-serif; font-size: 22px; color: var(–green); letter-spacing: 0.04em; }
.prob-no { font-family: ‘Bebas Neue’, sans-serif; font-size: 22px; color: var(–red); letter-spacing: 0.04em; }
.prob-bar { height: 3px; background: var(–muted); margin-bottom: 12px; overflow: hidden; }
.prob-fill { height: 100%; background: linear-gradient(90deg, var(–green), #0EA5E9); transition: width 0.8s ease; }
.card-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid var(–border); }
.card-vol { font-family: ‘JetBrains Mono’, monospace; font-size: 10px; color: var(–text-dim); }
.card-expiry { font-family: ‘JetBrains Mono’, monospace; font-size: 10px; color: var(–text-dim); }
.card-bet-row { display: flex; gap: 6px; margin-top: 10px; }
.resolved-badge { font-family: ‘Barlow Condensed’, sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 3px 10px; }

/* MARKET DETAIL */
.market-detail { max-width: 800px; margin: 0 auto; }
.back-btn { font-family: ‘Barlow Condensed’, sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(–text-dim); background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 8px; margin-bottom: 24px; transition: color 0.2s; }
.back-btn:hover { color: var(–text); }
.detail-header { border: 1px solid var(–border); background: var(–deep); padding: 28px; margin-bottom: 1px; position: relative; overflow: hidden; }
.detail-header::before { content: ‘’; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, var(–accent), transparent); }
.detail-category { font-family: ‘JetBrains Mono’, monospace; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: var(–accent); margin-bottom: 12px; }
.detail-question { font-family: ‘Barlow Condensed’, sans-serif; font-size: 26px; font-weight: 600; color: var(–white); line-height: 1.3; margin-bottom: 24px; }
.detail-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(–border); border: 1px solid var(–border); margin-bottom: 24px; }
.detail-stat { background: var(–surface); padding: 16px; }
.detail-stat-label { font-family: ‘JetBrains Mono’, monospace; font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; color: var(–text-dim); margin-bottom: 6px; }
.detail-stat-value { font-family: ‘Bebas Neue’, sans-serif; font-size: 28px; color: var(–white); letter-spacing: 0.04em; }
.big-prob { display: flex; align-items: center; gap: 24px; margin-bottom: 20px; }
.big-yes { font-family: ‘Bebas Neue’, sans-serif; font-size: 56px; color: var(–green); letter-spacing: 0.02em; line-height: 1; }
.big-no { font-family: ‘Bebas Neue’, sans-serif; font-size: 56px; color: var(–red); letter-spacing: 0.02em; line-height: 1; }
.big-prob-bar { flex: 1; height: 8px; background: var(–muted); overflow: hidden; }
.big-prob-fill { height: 100%; background: linear-gradient(90deg, var(–green), #0EA5E9); transition: width 0.8s ease; }

/* BET PANEL */
.bet-panel { border: 1px solid var(–border); background: var(–deep); padding: 24px; margin-bottom: 1px; }
.bet-panel-title { font-family: ‘Barlow Condensed’, sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: var(–text-mid); margin-bottom: 16px; }
.bet-sides { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px; }
.bet-side { border: 2px solid var(–border); padding: 14px; cursor: pointer; transition: all 0.15s; text-align: center; }
.bet-side.yes.selected { border-color: var(–green); background: rgba(16,185,129,0.08); }
.bet-side.no.selected { border-color: var(–red); background: rgba(239,68,68,0.08); }
.bet-side:hover { border-color: var(–text-dim); }
.bet-side-label { font-family: ‘Bebas Neue’, sans-serif; font-size: 28px; letter-spacing: 0.06em; }
.bet-side.yes .bet-side-label { color: var(–green); }
.bet-side.no .bet-side-label { color: var(–red); }
.bet-side-price { font-family: ‘JetBrains Mono’, monospace; font-size: 11px; color: var(–text-dim); }
.bet-input-row { display: flex; gap: 8px; margin-bottom: 12px; align-items: center; }
.bet-input { flex: 1; background: var(–surface); border: 1px solid var(–border); color: var(–white); font-family: ‘JetBrains Mono’, monospace; font-size: 14px; padding: 10px 14px; outline: none; transition: border-color 0.15s; }
.bet-input:focus { border-color: var(–accent); }
.bet-input::placeholder { color: var(–text-dim); }
.quick-amounts { display: flex; gap: 6px; margin-bottom: 16px; }
.quick-btn { font-family: ‘JetBrains Mono’, monospace; font-size: 10px; background: var(–surface); border: 1px solid var(–border); color: var(–text-dim); padding: 5px 10px; cursor: pointer; transition: all 0.15s; }
.quick-btn:hover { border-color: var(–text-mid); color: var(–text); }
.bet-summary { background: var(–surface); border: 1px solid var(–border); padding: 14px; margin-bottom: 16px; }
.bet-summary-row { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; }
.bet-summary-label { font-family: ‘JetBrains Mono’, monospace; font-size: 10px; color: var(–text-dim); letter-spacing: 0.1em; text-transform: uppercase; }
.bet-summary-value { font-family: ‘JetBrains Mono’, monospace; font-size: 12px; color: var(–text); }
.bet-summary-value.profit { color: var(–green); }
.bet-msg { font-family: ‘Barlow Condensed’, sans-serif; font-size: 13px; padding: 10px 14px; margin-bottom: 12px; text-align: center; font-weight: 600; letter-spacing: 0.05em; }
.bet-msg.success { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); color: var(–green); }
.bet-msg.error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: var(–red); }

/* PORTFOLIO */
.portfolio-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: var(–border); border: 1px solid var(–border); margin-bottom: 24px; }
.portfolio-stat { background: var(–deep); padding: 20px; }
.portfolio-stat-label { font-family: ‘JetBrains Mono’, monospace; font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; color: var(–text-dim); margin-bottom: 8px; }
.portfolio-stat-value { font-family: ‘Bebas Neue’, sans-serif; font-size: 32px; letter-spacing: 0.03em; }
.pos-table { border: 1px solid var(–border); background: var(–deep); overflow: hidden; }
.pos-table-header { display: grid; grid-template-columns: 1fr 80px 90px 90px 90px; gap: 0; padding: 10px 20px; border-bottom: 1px solid var(–border); background: var(–surface); }
.pos-th { font-family: ‘JetBrains Mono’, monospace; font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; color: var(–text-dim); }
.pos-row { display: grid; grid-template-columns: 1fr 80px 90px 90px 90px; gap: 0; padding: 14px 20px; border-bottom: 1px solid var(–border); align-items: center; transition: background 0.1s; }
.pos-row:last-child { border-bottom: none; }
.pos-row:hover { background: var(–surface); }
.pos-question { font-size: 13px; color: var(–text); line-height: 1.3; cursor: pointer; }
.pos-question:hover { color: var(–accent); }
.pos-badge { font-family: ‘Barlow Condensed’, sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 3px 8px; display: inline-block; }
.badge-yes { background: rgba(16,185,129,0.15); color: var(–green); border: 1px solid rgba(16,185,129,0.3); }
.badge-no { background: rgba(239,68,68,0.15); color: var(–red); border: 1px solid rgba(239,68,68,0.3); }
.pos-mono { font-family: ‘JetBrains Mono’, monospace; font-size: 12px; color: var(–text-mid); }
.pos-pnl { font-family: ‘JetBrains Mono’, monospace; font-size: 12px; }
.pnl-pos { color: var(–green); }
.pnl-neg { color: var(–red); }
.sell-btn { font-family: ‘Barlow Condensed’, sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: var(–red); padding: 4px 10px; cursor: pointer; transition: all 0.15s; }
.sell-btn:hover { background: rgba(239,68,68,0.2); }
.empty-state { text-align: center; padding: 60px 24px; }
.empty-icon { font-size: 40px; margin-bottom: 16px; }
.empty-title { font-family: ‘Bebas Neue’, sans-serif; font-size: 24px; color: var(–text-mid); letter-spacing: 0.06em; margin-bottom: 8px; }
.empty-desc { font-size: 14px; color: var(–text-dim); margin-bottom: 20px; }

/* LEADERBOARD */
.leaderboard-table { border: 1px solid var(–border); background: var(–deep); overflow: hidden; }
.lb-header { display: grid; grid-template-columns: 48px 1fr 100px 100px 100px; gap: 0; padding: 10px 20px; border-bottom: 1px solid var(–border); background: var(–surface); }
.lb-row { display: grid; grid-template-columns: 48px 1fr 100px 100px 100px; gap: 0; padding: 14px 20px; border-bottom: 1px solid var(–border); align-items: center; transition: background 0.1s; }
.lb-row:last-child { border-bottom: none; }
.lb-row:hover { background: var(–surface); }
.lb-row.is-user { background: rgba(0,212,255,0.04); border-left: 2px solid var(–accent); }
.lb-rank { font-family: ‘Bebas Neue’, sans-serif; font-size: 22px; color: var(–text-dim); letter-spacing: 0.04em; }
.lb-rank.gold { color: var(–gold); }
.lb-rank.silver { color: #94A3B8; }
.lb-rank.bronze { color: #CD7F32; }
.lb-name { font-family: ‘Barlow Condensed’, sans-serif; font-size: 15px; font-weight: 600; color: var(–text); letter-spacing: 0.04em; }
.lb-name.is-user { color: var(–accent); }
.lb-you { font-family: ‘JetBrains Mono’, monospace; font-size: 9px; color: var(–accent); letter-spacing: 0.1em; margin-left: 8px; }
.lb-mono { font-family: ‘JetBrains Mono’, monospace; font-size: 12px; color: var(–text-mid); text-align: right; }

/* ADMIN */
.admin-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.admin-panel { border: 1px solid var(–border); background: var(–deep); padding: 24px; }
.admin-panel-title { font-family: ‘Barlow Condensed’, sans-serif; font-size: 14px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: var(–text-mid); margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
.admin-panel-title::before { content: ‘’; width: 3px; height: 16px; background: var(–accent); }
.form-group { margin-bottom: 14px; }
.form-label { font-family: ‘JetBrains Mono’, monospace; font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: var(–text-dim); display: block; margin-bottom: 6px; }
.form-input { width: 100%; background: var(–surface); border: 1px solid var(–border); color: var(–white); font-family: ‘Barlow’, sans-serif; font-size: 13px; padding: 9px 12px; outline: none; transition: border-color 0.15s; }
.form-input:focus { border-color: var(–accent); }
.form-select { width: 100%; background: var(–surface); border: 1px solid var(–border); color: var(–white); font-family: ‘Barlow’, sans-serif; font-size: 13px; padding: 9px 12px; outline: none; cursor: pointer; }
.resolve-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(–border); gap: 12px; }
.resolve-item:last-child { border-bottom: none; }
.resolve-q { font-size: 12px; color: var(–text); line-height: 1.4; flex: 1; }
.resolve-btns { display: flex; gap: 6px; flex-shrink: 0; }
.toast { position: fixed; bottom: 24px; right: 24px; background: var(–surface); border: 1px solid var(–border); padding: 14px 20px; font-family: ‘Barlow Condensed’, sans-serif; font-size: 14px; font-weight: 600; letter-spacing: 0.05em; color: var(–white); z-index: 999; border-left: 3px solid var(–accent); animation: slideIn 0.3s ease; max-width: 320px; }
@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

/* MISC */
.section-title { font-family: ‘Bebas Neue’, sans-serif; font-size: 28px; color: var(–white); letter-spacing: 0.04em; margin-bottom: 16px; }
.divider { height: 1px; background: var(–border); margin: 24px 0; }
.tag { font-family: ‘JetBrains Mono’, monospace; font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; padding: 3px 8px; border: 1px solid var(–border); color: var(–text-dim); }
.live-dot { display: inline-flex; align-items: center; gap: 5px; font-family: ‘JetBrains Mono’, monospace; font-size: 9px; color: var(–green); letter-spacing: 0.1em; }
.live-dot::before { content: ‘’; width: 5px; height: 5px; border-radius: 50%; background: var(–green); animation: pulse 2s infinite; }
@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }

@media (max-width: 640px) {
.markets-grid { grid-template-columns: 1fr; }
.portfolio-grid { grid-template-columns: repeat(2,1fr); }
.pos-table-header, .pos-row { grid-template-columns: 1fr 70px 80px; }
.pos-th:nth-child(4), .pos-row > *:nth-child(4), .pos-th:nth-child(5), .pos-row > *:nth-child(5) { display: none; }
.admin-grid { grid-template-columns: 1fr; }
.lb-header, .lb-row { grid-template-columns: 40px 1fr 90px; }
.lb-header > *:nth-child(4), .lb-row > *:nth-child(4), .lb-header > *:nth-child(5), .lb-row > *:nth-child(5) { display: none; }
.nav-tabs { display: none; }
.detail-stats { grid-template-columns: 1fr 1fr; }
.big-yes, .big-no { font-size: 40px; }
}
`;

// ─── LEADERBOARD DATA ────────────────────────────────────────────────────────

const LEADERBOARD_USERS = [
{ name: “SharpTrader_99”, profit: 12840, accuracy: 71, trades: 94 },
{ name: “MarketWizard”, profit: 9320, accuracy: 68, trades: 71 },
{ name: “Quant_Kelly”, profit: 7650, accuracy: 65, trades: 88 },
{ name: “BullsAndBears”, profit: 5420, accuracy: 63, trades: 55 },
{ name: “AlphaSeeker”, profit: 4180, accuracy: 61, trades: 42 },
{ name: “FedWatcher”, profit: 3290, accuracy: 59, trades: 38 },
{ name: “VolTrader”, profit: 2140, accuracy: 57, trades: 61 },
{ name: “MacroMike”, profit: 1880, accuracy: 55, trades: 29 },
];

// ─── MAIN APP ────────────────────────────────────────────────────────────────

export default function TradrMarkets() {
const [tab, setTab] = useState(“markets”);
const [markets, setMarkets] = useState(INITIAL_MARKETS);
const [positions, setPositions] = useState([]);
const [balance, setBalance] = useState(1000);
const [selectedMarket, setSelectedMarket] = useState(null);
const [filter, setFilter] = useState(“ALL”);
const [betSide, setBetSide] = useState(“YES”);
const [betAmount, setBetAmount] = useState(””);
const [betMsg, setBetMsg] = useState(null);
const [toast, setToast] = useState(null);
const [newMarket, setNewMarket] = useState({ question: “”, category: “STOCK”, ticker: “”, expiry: “” });
const [username] = useState(“You”);

// Live market simulation
useEffect(() => {
const interval = setInterval(() => {
setMarkets(prev => prev.map(m => {
if (m.resolved) return m;
const delta = (Math.random() - 0.5) * 0.015;
return { …m, yesProb: Math.max(0.03, Math.min(0.97, m.yesProb + delta)) };
}));
}, 3000);
return () => clearInterval(interval);
}, []);

// Auto-clear toast
useEffect(() => {
if (toast) {
const t = setTimeout(() => setToast(null), 3000);
return () => clearTimeout(t);
}
}, [toast]);

const showToast = (msg) => setToast(msg);

// Portfolio calculations
const totalInvested = positions.filter(p => !p.sold && !p.resolved).reduce((s, p) => s + p.amount, 0);
const totalPnl = positions.reduce((s, p) => {
if (p.resolved) return s + (p.payout - p.amount);
if (p.sold) return s + (p.sellPrice - p.amount);
const market = markets.find(m => m.id === p.marketId);
if (!market) return s;
const currentPrice = p.side === “YES” ? market.yesProb : (1 - market.yesProb);
const shares = p.amount / p.buyPrice;
return s + (shares * currentPrice - p.amount);
}, 0);

const openPositions = positions.filter(p => !p.sold && !p.resolved);
const closedPositions = positions.filter(p => p.sold || p.resolved);

// Place bet
const placeBet = () => {
const amt = parseFloat(betAmount);
if (!amt || amt <= 0) { setBetMsg({ type: “error”, text: “Enter a valid amount” }); return; }
if (amt > balance) { setBetMsg({ type: “error”, text: “Insufficient balance” }); return; }
if (amt < 1) { setBetMsg({ type: “error”, text: “Minimum bet is $1” }); return; }

```
const market = selectedMarket;
const price = betSide === "YES" ? market.yesProb : (1 - market.yesProb);
const shares = amt / price;
const potentialPayout = shares * 1;

const position = {
  id: Date.now(),
  marketId: market.id,
  question: market.question,
  side: betSide,
  amount: amt,
  buyPrice: price,
  shares,
  potentialPayout,
  sold: false,
  resolved: false,
  payout: 0,
  sellPrice: 0,
  timestamp: new Date().toLocaleTimeString(),
};

setPositions(prev => [...prev, position]);
setBalance(prev => prev - amt);
setMarkets(prev => prev.map(m => m.id === market.id ? { ...m, volume: m.volume + amt } : m));
setBetAmount("");
setBetMsg({ type: "success", text: `✓ ${betSide} position opened — ${shares.toFixed(1)} shares @ ${(price * 100).toFixed(0)}¢` });
showToast(`Bet placed: $${amt} ${betSide} on ${market.ticker}`);

setTimeout(() => setBetMsg(null), 3000);
```

};

// Sell position
const sellPosition = (posId) => {
const pos = positions.find(p => p.id === posId);
if (!pos) return;
const market = markets.find(m => m.id === pos.marketId);
const currentPrice = pos.side === “YES” ? market.yesProb : (1 - market.yesProb);
const sellValue = pos.shares * currentPrice;

```
setPositions(prev => prev.map(p => p.id === posId ? { ...p, sold: true, sellPrice: sellValue } : p));
setBalance(prev => prev + sellValue);
showToast(`Position sold for ${formatCurrency(sellValue)}`);
```

};

// Resolve market (admin)
const resolveMarket = (marketId, result) => {
setMarkets(prev => prev.map(m => m.id === marketId ? { …m, resolved: true, result } : m));

```
const affectedPositions = positions.filter(p => p.marketId === marketId && !p.sold && !p.resolved);
let totalPayout = 0;

setPositions(prev => prev.map(p => {
  if (p.marketId !== marketId || p.sold || p.resolved) return p;
  const won = p.side === result;
  const payout = won ? p.shares * 1 : 0;
  totalPayout += payout;
  return { ...p, resolved: true, payout };
}));

setBalance(prev => prev + totalPayout);
showToast(`Market resolved: ${result}. ${affectedPositions.length} position(s) settled.`);
```

};

// Create market (admin)
const createMarket = () => {
if (!newMarket.question || !newMarket.ticker || !newMarket.expiry) { showToast(“Fill in all fields”); return; }
const market = {
id: Date.now(),
category: newMarket.category,
ticker: newMarket.ticker.toUpperCase(),
question: newMarket.question,
yesProb: 0.50,
volume: 0,
expiry: newMarket.expiry,
resolved: false,
result: null,
};
setMarkets(prev => […prev, market]);
setNewMarket({ question: “”, category: “STOCK”, ticker: “”, expiry: “” });
showToast(`Market created: ${market.ticker}`);
};

// Leaderboard data including user
const userProfit = totalPnl;
const userAccuracy = positions.length > 0
? Math.round((positions.filter(p => p.resolved && p.payout > 0).length / Math.max(1, positions.filter(p => p.resolved).length)) * 100)
: 0;
const fullLeaderboard = [
…LEADERBOARD_USERS,
{ name: username, profit: userProfit, accuracy: userAccuracy, trades: positions.length, isUser: true }
].sort((a, b) => b.profit - a.profit);

const filteredMarkets = markets.filter(m => filter === “ALL” || m.category === filter);

// ── VIEWS ──────────────────────────────────────────────────────────────────

const MarketCard = ({ market }) => (
<div className=“market-card” onClick={() => { setSelectedMarket(market); setTab(“detail”); setBetMsg(null); setBetAmount(””); }}>
<div className="card-tag">
<span className=“tag-dot” style={{ background: CATEGORY_COLORS[market.category] }} />
{market.category} · {market.ticker}
{market.resolved && <span className=“resolved-badge” style={{ background: market.result === “YES” ? “rgba(16,185,129,0.15)” : “rgba(239,68,68,0.15)”, color: market.result === “YES” ? “var(–green)” : “var(–red)”, border: `1px solid ${market.result === "YES" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}` }}>RESOLVED {market.result}</span>}
</div>
<div className="card-question">{market.question}</div>
<div className="prob-row">
<span className="prob-yes">{(market.yesProb * 100).toFixed(0)}% YES</span>
<span className="prob-no">{((1 - market.yesProb) * 100).toFixed(0)}% NO</span>
</div>
<div className="prob-bar"><div className=“prob-fill” style={{ width: `${market.yesProb * 100}%` }} /></div>
<div className="card-footer">
<span className="card-vol">{formatMoney(market.volume)} vol</span>
<span className="card-expiry">Exp {market.expiry}</span>
</div>
</div>
);

const MarketsView = () => (
<div className="page">
<div className="markets-header">
<div>
<div className="page-title">LIVE MARKETS</div>
<div className="page-subtitle"><span className="live-dot">LIVE</span>  {markets.filter(m => !m.resolved).length} open · {markets.filter(m => m.resolved).length} resolved</div>
</div>
<div className="filters">
{[“ALL”, “STOCK”, “MACRO”, “EARNINGS”, “CRYPTO”, “IPO”].map(f => (
<button key={f} className={`filter-btn ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>{f}</button>
))}
</div>
</div>
<div className="markets-grid">
{filteredMarkets.map(m => <MarketCard key={m.id} market={m} />)}
</div>
</div>
);

const DetailView = () => {
const market = selectedMarket;
if (!market) return null;
const liveMarket = markets.find(m => m.id === market.id);
const price = betSide === “YES” ? liveMarket.yesProb : (1 - liveMarket.yesProb);
const amt = parseFloat(betAmount) || 0;
const shares = amt > 0 ? amt / price : 0;
const potential = shares * 1;
const profit = potential - amt;

```
return (
  <div className="page">
    <button className="back-btn" onClick={() => setTab("markets")}>← Back to Markets</button>
    <div className="market-detail">
      <div className="detail-header">
        <div className="detail-category" style={{ color: CATEGORY_COLORS[liveMarket.category] }}>{liveMarket.category} · {liveMarket.ticker} · Expires {liveMarket.expiry}</div>
        <div className="detail-question">{liveMarket.question}</div>
        <div className="big-prob">
          <span className="big-yes">{(liveMarket.yesProb * 100).toFixed(0)}¢</span>
          <div className="big-prob-bar"><div className="big-prob-fill" style={{ width: `${liveMarket.yesProb * 100}%` }} /></div>
          <span className="big-no">{((1 - liveMarket.yesProb) * 100).toFixed(0)}¢</span>
        </div>
        <div className="detail-stats">
          <div className="detail-stat">
            <div className="detail-stat-label">Volume</div>
            <div className="detail-stat-value" style={{ fontSize: 22 }}>{formatMoney(liveMarket.volume)}</div>
          </div>
          <div className="detail-stat">
            <div className="detail-stat-label">Status</div>
            <div className="detail-stat-value" style={{ fontSize: 18, color: liveMarket.resolved ? "var(--gold)" : "var(--green)" }}>{liveMarket.resolved ? `RESOLVED ${liveMarket.result}` : "OPEN"}</div>
          </div>
          <div className="detail-stat">
            <div className="detail-stat-label">Expiry</div>
            <div className="detail-stat-value" style={{ fontSize: 16 }}>{liveMarket.expiry}</div>
          </div>
        </div>
      </div>

      {!liveMarket.resolved && (
        <div className="bet-panel">
          <div className="bet-panel-title">Place Your Prediction</div>
          <div className="bet-sides">
            <div className={`bet-side yes ${betSide === "YES" ? "selected" : ""}`} onClick={() => setBetSide("YES")}>
              <div className="bet-side-label">YES</div>
              <div className="bet-side-price">{(liveMarket.yesProb * 100).toFixed(0)}¢ per share</div>
            </div>
            <div className={`bet-side no ${betSide === "NO" ? "selected" : ""}`} onClick={() => setBetSide("NO")}>
              <div className="bet-side-label">NO</div>
              <div className="bet-side-price">{((1 - liveMarket.yesProb) * 100).toFixed(0)}¢ per share</div>
            </div>
          </div>
          <div className="bet-input-row">
            <input className="bet-input" type="number" placeholder="$ Amount" value={betAmount} onChange={e => setBetAmount(e.target.value)} min="1" max={balance} />
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-dim)", whiteSpace: "nowrap" }}>Bal: <strong style={{ color: "var(--green)" }}>{formatCurrency(balance)}</strong></div>
          </div>
          <div className="quick-amounts">
            {[10, 25, 50, 100, 250].map(a => (
              <button key={a} className="quick-btn" onClick={() => setBetAmount(String(Math.min(a, balance)))}>${a}</button>
            ))}
            <button className="quick-btn" onClick={() => setBetAmount(String(Math.floor(balance)))}>MAX</button>
          </div>
          {amt > 0 && (
            <div className="bet-summary">
              <div className="bet-summary-row"><span className="bet-summary-label">Shares</span><span className="bet-summary-value">{shares.toFixed(2)}</span></div>
              <div className="bet-summary-row"><span className="bet-summary-label">Cost</span><span className="bet-summary-value">{formatCurrency(amt)}</span></div>
              <div className="bet-summary-row"><span className="bet-summary-label">If correct</span><span className="bet-summary-value profit">+{formatCurrency(profit)} profit</span></div>
              <div className="bet-summary-row"><span className="bet-summary-label">Return</span><span className="bet-summary-value profit">{amt > 0 ? ((profit / amt) * 100).toFixed(0) : 0}%</span></div>
            </div>
          )}
          {betMsg && <div className={`bet-msg ${betMsg.type}`}>{betMsg.text}</div>}
          <button className={`btn btn-lg btn-full ${betSide === "YES" ? "btn-green" : "btn-red"}`} onClick={placeBet}>
            Buy {betSide} {amt > 0 ? `· ${formatCurrency(amt)}` : ""}
          </button>
        </div>
      )}

      {liveMarket.resolved && (
        <div style={{ border: "1px solid var(--border)", background: "var(--deep)", padding: 24, textAlign: "center" }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: liveMarket.result === "YES" ? "var(--green)" : "var(--red)", letterSpacing: "0.04em", marginBottom: 8 }}>RESOLVED: {liveMarket.result}</div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, color: "var(--text-dim)" }}>This market has been resolved. Winning positions have been paid out.</div>
        </div>
      )}
    </div>
  </div>
);
```

};

const PortfolioView = () => (
<div className="page">
<div style={{ marginBottom: 20 }}>
<div className="page-title">MY PORTFOLIO</div>
<div className="page-subtitle">Your positions and P&L</div>
</div>
<div className="portfolio-grid">
<div className="portfolio-stat">
<div className="portfolio-stat-label">Balance</div>
<div className=“portfolio-stat-value” style={{ color: “var(–accent)” }}>{formatCurrency(balance)}</div>
</div>
<div className="portfolio-stat">
<div className="portfolio-stat-label">Invested</div>
<div className=“portfolio-stat-value” style={{ color: “var(–text)” }}>{formatCurrency(totalInvested)}</div>
</div>
<div className="portfolio-stat">
<div className="portfolio-stat-label">Total P&L</div>
<div className="portfolio-stat-value" style={{ color: totalPnl >= 0 ? “var(–green)” : “var(–red)” }}>{totalPnl >= 0 ? “+” : “”}{formatCurrency(totalPnl)}</div>
</div>
<div className="portfolio-stat">
<div className="portfolio-stat-label">Trades</div>
<div className=“portfolio-stat-value” style={{ color: “var(–text)” }}>{positions.length}</div>
</div>
</div>

```
  <div className="section-title">Open Positions</div>
  {openPositions.length === 0 ? (
    <div className="empty-state">
      <div className="empty-icon">📊</div>
      <div className="empty-title">No Open Positions</div>
      <div className="empty-desc">Browse markets and place your first prediction</div>
      <button className="btn btn-accent" onClick={() => setTab("markets")}>Browse Markets</button>
    </div>
  ) : (
    <div className="pos-table">
      <div className="pos-table-header">
        <span className="pos-th">Market</span>
        <span className="pos-th">Side</span>
        <span className="pos-th">Cost</span>
        <span className="pos-th">Current</span>
        <span className="pos-th">Action</span>
      </div>
      {openPositions.map(pos => {
        const market = markets.find(m => m.id === pos.marketId);
        const currentPrice = pos.side === "YES" ? market.yesProb : (1 - market.yesProb);
        const currentValue = pos.shares * currentPrice;
        const pnl = currentValue - pos.amount;
        return (
          <div key={pos.id} className="pos-row">
            <span className="pos-question" onClick={() => { setSelectedMarket(market); setTab("detail"); }}>{pos.question}</span>
            <span><span className={`pos-badge ${pos.side === "YES" ? "badge-yes" : "badge-no"}`}>{pos.side}</span></span>
            <span className="pos-mono">{formatCurrency(pos.amount)}</span>
            <span className={`pos-pnl ${pnl >= 0 ? "pnl-pos" : "pnl-neg"}`}>{pnl >= 0 ? "+" : ""}{formatCurrency(pnl)}</span>
            <button className="sell-btn" onClick={() => sellPosition(pos.id)}>Sell</button>
          </div>
        );
      })}
    </div>
  )}

  {closedPositions.length > 0 && (
    <>
      <div className="divider" />
      <div className="section-title">Closed Positions</div>
      <div className="pos-table">
        <div className="pos-table-header">
          <span className="pos-th">Market</span>
          <span className="pos-th">Side</span>
          <span className="pos-th">Cost</span>
          <span className="pos-th">P&L</span>
          <span className="pos-th">Status</span>
        </div>
        {closedPositions.map(pos => {
          const finalValue = pos.resolved ? pos.payout : pos.sellPrice;
          const pnl = finalValue - pos.amount;
          return (
            <div key={pos.id} className="pos-row">
              <span className="pos-question">{pos.question}</span>
              <span><span className={`pos-badge ${pos.side === "YES" ? "badge-yes" : "badge-no"}`}>{pos.side}</span></span>
              <span className="pos-mono">{formatCurrency(pos.amount)}</span>
              <span className={`pos-pnl ${pnl >= 0 ? "pnl-pos" : "pnl-neg"}`}>{pnl >= 0 ? "+" : ""}{formatCurrency(pnl)}</span>
              <span className="tag">{pos.resolved ? "RESOLVED" : "SOLD"}</span>
            </div>
          );
        })}
      </div>
    </>
  )}
</div>
```

);

const LeaderboardView = () => (
<div className="page">
<div style={{ marginBottom: 20 }}>
<div className="page-title">LEADERBOARD</div>
<div className="page-subtitle">Top predictors by profit</div>
</div>
<div className="leaderboard-table">
<div className="lb-header">
<span className="pos-th">#</span>
<span className="pos-th">Trader</span>
<span className=“pos-th” style={{ textAlign: “right” }}>Profit</span>
<span className=“pos-th” style={{ textAlign: “right” }}>Accuracy</span>
<span className=“pos-th” style={{ textAlign: “right” }}>Trades</span>
</div>
{fullLeaderboard.map((user, i) => (
<div key={user.name} className={`lb-row ${user.isUser ? "is-user" : ""}`}>
<span className={`lb-rank ${i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : ""}`}>{i + 1}</span>
<span>
<span className={`lb-name ${user.isUser ? "is-user" : ""}`}>{user.name}</span>
{user.isUser && <span className="lb-you">YOU</span>}
</span>
<span className="lb-mono" style={{ color: user.profit >= 0 ? “var(–green)” : “var(–red)” }}>{user.profit >= 0 ? “+” : “”}{formatCurrency(user.profit)}</span>
<span className="lb-mono">{user.accuracy}%</span>
<span className="lb-mono">{user.trades}</span>
</div>
))}
</div>
</div>
);

const AdminView = () => (
<div className="page">
<div style={{ marginBottom: 20 }}>
<div className="page-title">ADMIN PANEL</div>
<div className="page-subtitle">Create and resolve markets</div>
</div>
<div className="admin-grid">
<div className="admin-panel">
<div className="admin-panel-title">Create New Market</div>
<div className="form-group">
<label className="form-label">Question</label>
<input className=“form-input” placeholder=“Will NVDA hit $200 by Q2?” value={newMarket.question} onChange={e => setNewMarket(p => ({ …p, question: e.target.value }))} />
</div>
<div className="form-group">
<label className="form-label">Ticker</label>
<input className=“form-input” placeholder=“NVDA” value={newMarket.ticker} onChange={e => setNewMarket(p => ({ …p, ticker: e.target.value }))} />
</div>
<div className="form-group">
<label className="form-label">Category</label>
<select className=“form-select” value={newMarket.category} onChange={e => setNewMarket(p => ({ …p, category: e.target.value }))}>
<option>STOCK</option>
<option>MACRO</option>
<option>EARNINGS</option>
<option>CRYPTO</option>
<option>IPO</option>
</select>
</div>
<div className="form-group">
<label className="form-label">Expiry Date</label>
<input className=“form-input” placeholder=“Jun 30, 2026” value={newMarket.expiry} onChange={e => setNewMarket(p => ({ …p, expiry: e.target.value }))} />
</div>
<button className=“btn btn-accent btn-full” style={{ marginTop: 4 }} onClick={createMarket}>Create Market</button>
</div>

```
    <div className="admin-panel">
      <div className="admin-panel-title">Resolve Markets</div>
      {markets.filter(m => !m.resolved).length === 0 && (
        <div style={{ color: "var(--text-dim)", fontSize: 13, textAlign: "center", padding: "24px 0" }}>All markets resolved</div>
      )}
      {markets.filter(m => !m.resolved).map(m => (
        <div key={m.id} className="resolve-item">
          <div className="resolve-q">{m.question}</div>
          <div className="resolve-btns">
            <button className="btn btn-sm btn-green" onClick={() => resolveMarket(m.id, "YES")}>YES</button>
            <button className="btn btn-sm btn-red" onClick={() => resolveMarket(m.id, "NO")}>NO</button>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>
```

);

return (
<>
<style>{css}</style>
<div className="app">
<nav className="nav">
<div className=“nav-logo” onClick={() => setTab(“markets”)}>
<svg width="20" height="24" viewBox="0 0 32 36" fill="none">
<path d="M16 0L0 6V18C0 27.3 7.3 35.1 16 36C24.7 35.1 32 27.3 32 18V6L16 0Z" fill="#0D1117"/>
<path d="M16 1.5L1.5 7.2V18C1.5 26.6 8.1 34 16 34.5C23.9 34 30.5 26.6 30.5 18V7.2L16 1.5Z" stroke="#00D4FF" strokeWidth="0.8"/>
<rect x="10" y="16" width="2" height="8" fill="#00D4FF"/>
<rect x="14" y="12" width="2" height="12" fill="#00D4FF"/>
<rect x="18" y="14" width="2" height="10" fill="#00D4FF"/>
<rect x="22" y="10" width="2" height="14" fill="#00D4FF"/>
</svg>
TRADR <span>MARKETS</span>
</div>
<div className="nav-tabs">
{[[“markets”, “Markets”], [“portfolio”, “Portfolio”], [“leaderboard”, “Leaderboard”], [“admin”, “Admin”]].map(([id, label]) => (
<button key={id} className={`nav-tab ${tab === id || (tab === "detail" && id === "markets") ? "active" : ""}`} onClick={() => { setTab(id); if (id !== “detail”) setSelectedMarket(null); }}>{label}</button>
))}
</div>
<div className="nav-right">
<div className="balance-display">Balance: <strong>{formatCurrency(balance)}</strong></div>
<button className=“btn btn-ghost btn-sm” onClick={() => { setBalance(b => b + 500); showToast(”$500 added to your balance”); }}>+ Add Funds</button>
</div>
</nav>

```
    {tab === "markets" && <MarketsView />}
    {tab === "detail" && <DetailView />}
    {tab === "portfolio" && <PortfolioView />}
    {tab === "leaderboard" && <LeaderboardView />}
    {tab === "admin" && <AdminView />}

    {toast && <div className="toast">{toast}</div>}
  </div>
</>
```

);
}
