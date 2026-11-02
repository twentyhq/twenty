import { OAUTH_MODAL_HEADER_IMAGE_BASE64 } from '@/oauth/constants/oauth-modal-header-image-base64.constant';

export const renderCallbackPage = ({
  isSuccess,
  isDarkMode,
}: {
  isSuccess: boolean;
  isDarkMode: boolean;
}) => {
  const title = isSuccess
    ? 'Authentication successful'
    : 'Authentication failed';
  const message = isSuccess
    ? 'You can close this window and return to the terminal.'
    : 'Sign-in did not complete. Return to the terminal for details and try again.';

  return `<!DOCTYPE html>
<html lang="en"${isDarkMode ? ' class="dark"' : ''}>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} | Twenty CLI</title>
  <style>
    :root {
      --bg-body: #fafafa;
      --bg-card: #fff;
      --bg-logo-tile: #fff;
      --text-primary: #333;
      --text-secondary: #666;
      --shadow: 2px 4px 16px 0 rgba(0,0,0,0.16), 0 2px 4px 0 rgba(0,0,0,0.08);
      --success-bg: #f0faf0;
      --error-bg: #fef0f0;
    }
    html.dark {
      --bg-body: #171717;
      --bg-card: #1b1b1b;
      --bg-logo-tile: #2b2b2b;
      --text-primary: #e6e6e6;
      --text-secondary: #999;
      --shadow: 2px 4px 16px 0 rgba(0,0,0,0.5), 0 2px 4px 0 rgba(0,0,0,0.3);
      --success-bg: #0a2e0a;
      --error-bg: #2e0a0a;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg-body);
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100dvh;
      padding: 24px;
      color: var(--text-primary);
    }
    .card {
      background: var(--bg-card);
      border-radius: 8px;
      box-shadow: var(--shadow);
      max-width: min(100%, 360px);
      width: fit-content;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .header {
      height: 120px;
      width: 100%;
      display: flex;
      align-items: center;
      gap: 8px;
      justify-content: center;
      background-image: url('data:image/png;base64,${OAUTH_MODAL_HEADER_IMAGE_BASE64}');
      background-position: center;
      background-size: cover;
    }
    .logo-tile {
      width: 36px;
      height: 36px;
      padding: 4px;
      background: var(--bg-logo-tile);
      border-radius: 100%;
      box-shadow: var(--shadow);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .status-icon {
      width: 24px;
      height: 24px;
      border-radius: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .status-icon svg {
      width: 20px;
      height: 20px;
    }
    .status-icon-success { background: var(--success-bg); }
    .status-icon-error { background: var(--error-bg); }
    .content {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px;
    }
    h1 {
      font-size: 1rem;
      font-weight: 500;
      line-height: 1.1;
      color: var(--text-primary);
      text-align: center;
      text-wrap: balance;
      margin-bottom: 16px;
    }
    p {
      font-size: 0.82rem;
      color: var(--text-secondary);
      text-align: center;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="logo-tile">
        <div aria-hidden="true" class="status-icon ${isSuccess ? 'status-icon-success' : 'status-icon-error'}">
          ${
            isSuccess
              ? '<svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
              : '<svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
          }
        </div>
      </div>
    </div>
    <div class="content">
      <h1>${title}</h1>
      <p>${message}</p>
    </div>
  </div>
</body>
</html>`;
};
