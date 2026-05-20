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
}: {
  title: string;
  message: string;
  isSuccess: boolean;
}) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} — Twenty</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #fafafa;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100dvh;
      color: #333;
    }
    .card {
      background: #fff;
      border-radius: 8px;
      box-shadow: 2px 4px 16px 0 rgba(0,0,0,0.16), 0 2px 4px 0 rgba(0,0,0,0.08);
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
      background: #fff;
      border-radius: 100%;
      box-shadow: 2px 4px 16px 0 rgba(0,0,0,0.16), 0 2px 4px 0 rgba(0,0,0,0.08);
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
    .status-icon-success { background: #f0faf0; }
    .status-icon-error { background: #fef0f0; }
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
      color: #333;
      text-align: center;
      text-wrap: balance;
      margin-bottom: 16px;
    }
    p {
      font-size: 0.82rem;
      color: #666;
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

const successHtml = () =>
  pageHtml({
    title: 'Authentication successful',
    message: 'You can close this window and return to the terminal.',
    isSuccess: true,
  });

const escapeHtml = (text: string): string =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const errorHtml = (error: string) =>
  pageHtml({
    title: 'Authentication failed',
    message: `${escapeHtml(error)}<br>Please return to the terminal and try again.`,
    isSuccess: false,
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
        res.writeHead(404);
        res.end('Not found');

        return;
      }

      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');

      const headers = {
        'Content-Type': 'text/html',
        Connection: 'close',
      };

      if (code) {
        res.writeHead(200, headers);
        res.end(successHtml());
        callbackResolve({ success: true, code });
      } else {
        const errorMessage =
          error ?? url.searchParams.get('error_description') ?? 'Unknown error';

        res.writeHead(200, headers);
        res.end(errorHtml(errorMessage));
        callbackResolve({ success: false, error: errorMessage });
      }
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
          server.closeAllConnections();
          server.close();
        },
      });
    });

    server.on('error', reject);
  });
};
