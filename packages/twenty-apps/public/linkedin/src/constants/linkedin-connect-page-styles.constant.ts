import { type SafeHtml } from 'src/types/safe-html.type';

export const LINKEDIN_CONNECT_PAGE_STYLES: SafeHtml = {
  safeHtml: `
    :root {
      color-scheme: light dark;
      --page: #f1f1f1;
      --card: #ffffff;
      --border: #d6d6d6;
      --text: #333333;
      --muted: #666666;
      --accent: #3e63dd;
      --danger: #ce2c31;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --page: #171717;
        --card: #1d1d1d;
        --border: #444444;
        --text: #ebebeb;
        --muted: #b3b3b3;
        --accent: #5472e4;
        --danger: #ff9592;
      }
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      background: var(--page);
      color: var(--text);
      font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      line-height: 1.5;
    }
    main {
      width: 100%;
      max-width: 360px;
      padding: 32px;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 8px;
    }
    svg { display: block; width: 40px; height: 40px; }
    h1 { margin: 16px 0 8px; font-size: 18px; font-weight: 600; }
    p { margin: 0 0 16px; color: var(--muted); }
    strong { color: var(--text); }
    form { display: flex; flex-direction: column; gap: 8px; }
    label { font-size: 12px; font-weight: 500; }
    input {
      width: 100%;
      height: 32px;
      margin-bottom: 8px;
      padding: 0 8px;
      background: transparent;
      color: var(--text);
      border: 1px solid var(--border);
      border-radius: 4px;
      font: inherit;
    }
    input:focus { outline: none; border-color: var(--accent); }
    button, a.button {
      display: block;
      width: 100%;
      height: 32px;
      margin-top: 8px;
      background: var(--accent);
      color: #ffffff;
      border: 1px solid var(--accent);
      border-radius: 4px;
      font: inherit;
      font-weight: 500;
      line-height: 30px;
      text-align: center;
      text-decoration: none;
      cursor: pointer;
    }
    button.secondary {
      margin-top: 0;
      background: transparent;
      color: var(--text);
      border-color: var(--border);
    }
    button:disabled { opacity: 0.6; cursor: default; }
    .error { color: var(--danger); }
    .footnote { margin: 16px 0 0; font-size: 12px; }
    .footnote a { color: inherit; }
    .spinner {
      width: 24px;
      height: 24px;
      margin: 8px 0 16px;
      border: 2px solid var(--border);
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `,
};
