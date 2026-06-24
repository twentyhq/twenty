import http from 'node:http';

import { OAUTH_MODAL_HEADER_IMAGE_BASE64 } from '@/cli/constants/oauth-modal-header-image-base64';

type CallbackResult =
  | { success: true; code: string }
  | { success: false; error: string };

type CallbackServer = {
  port: number;
  callbackUrl: string;
  waitForCallback: () => Promise<CallbackResult>;
  close: () => void;
};

const pageHtml = ({
  title,
  message,
  isSuccess,
  isDarkMode,
}: {
  title: string;
  message: string;
  isSuccess: boolean;
  isDarkMode: boolean;
}) => `<!DOCTYPE html>
<html lang="en"${isDarkMode ? ' class="dark"' : ''}>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} — Twenty</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
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
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--bg-body);
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100dvh;
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
    h2 {
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
        <div class="status-icon ${isSuccess ? 'status-icon-success' : 'status-icon-error'}">
          ${
            isSuccess
              ? '<svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
              : '<svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
          }
        </div>
      </div>
    </div>
    <div class="content">
      <h2>${title}</h2>
      <p>${message}</p>
    </div>
  </div>
</body>
</html>`;

const successHtml = (isDarkMode: boolean) =>
  pageHtml({
    title: 'Authentication successful',
    message: 'You can close this window and return to the terminal.',
    isSuccess: true,
    isDarkMode,
  });

const escapeHtml = (text: string): string =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const errorHtml = (error: string, isDarkMode: boolean) =>
  pageHtml({
    title: 'Authentication failed',
    message: `${escapeHtml(error)}<br>Please return to the terminal and try again.`,
    isSuccess: false,
    isDarkMode,
  });

export const startCallbackServer = (options?: {
  timeoutMs?: number;
}): Promise<CallbackServer> => {
  const timeoutMs = options?.timeoutMs ?? 120_000;

  return new Promise((resolve, reject) => {
    let callbackResolve: (result: CallbackResult) => void;
    let timeoutHandle: ReturnType<typeof setTimeout>;

    const callbackPromise = new Promise<CallbackResult>((res) => {
      callbackResolve = res;
    });

    const server = http.createServer((req, res) => {
      const url = new URL(req.url ?? '/', `http://127.0.0.1`);

      if (url.pathname !== '/callback') {
        res.writeHead(404, { Connection: 'close' });
        res.end('Not found');

        return;
      }

      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');
      const isDarkMode = url.searchParams.get('theme') === 'dark';

      const result: CallbackResult = code
        ? { success: true, code }
        : {
            success: false,
            error:
              error ??
              url.searchParams.get('error_description') ??
              'Unknown error',
          };

      const body = result.success
        ? successHtml(isDarkMode)
        : errorHtml(result.error, isDarkMode);

      res.writeHead(200, {
        'Content-Type': 'text/html',
        'Content-Length': Buffer.byteLength(body),
        Connection: 'close',
      });

      // Resolve the callback only once this socket has fully closed, not as soon
      // as the body is written. The caller (login-oauth) tears the server down
      // the instant waitForCallback resolves; if we resolved earlier the
      // teardown would hard-destroy the still-open socket with a TCP RST, and on
      // fast localhost the RST reaches the browser before it has drained the
      // response — the kernel then discards the unread bytes and the page is
      // blank. Letting the socket close gracefully (Connection: close → FIN)
      // guarantees the page is delivered before we hand control back.
      res.on('close', () => callbackResolve(result));
      res.end(body);
    });

    server.listen(0, '127.0.0.1', () => {
      const address = server.address();

      if (!address || typeof address === 'string') {
        reject(new Error('Failed to start callback server'));

        return;
      }

      const port = address.port;

      resolve({
        port,
        callbackUrl: `http://127.0.0.1:${port}/callback`,
        waitForCallback: () => {
          timeoutHandle = setTimeout(() => {
            callbackResolve({
              success: false,
              error: `Timed out waiting for authorization (${timeoutMs / 1000}s)`,
            });
          }, timeoutMs);

          return callbackPromise.finally(() => {
            clearTimeout(timeoutHandle);
          });
        },
        close: () => {
          clearTimeout(timeoutHandle);
          // Stop accepting new connections and free the port immediately, but
          // never hard-destroy live sockets: closeAllConnections() would RST the
          // socket still delivering the page and leave the browser blank.
          // closeIdleConnections() only reaps idle keep-alive sockets (which
          // carry no pending response) so the process can still exit.
          server.close();
          server.closeIdleConnections();
        },
      });
    });

    server.on('error', reject);
  });
};
