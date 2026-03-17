import http from 'node:http';

type CallbackResult =
  | { success: true; code: string }
  | { success: false; error: string };

type CallbackServer = {
  port: number;
  callbackUrl: string;
  waitForCallback: () => Promise<CallbackResult>;
  close: () => void;
};

const TWENTY_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 96 96">
<rect width="96" height="96" rx="11.3" fill="#000"/>
<path fill="#fff" d="M19.25 35.75c0-5.25 4.26-9.5 9.5-9.5h18.29c.27 0 .51.16.63.4.11.25.06.54-.12.75l-4.01 4.35c-.7.76-1.68 1.2-2.71 1.2H28.8c-1.57 0-2.85 1.27-2.85 2.85v7.18c0 .93-.75 1.67-1.68 1.67h-3.34c-.93 0-1.67-.75-1.67-1.67v-7.23z"/>
<path fill="#fff" d="M76.15 60.25c0 5.25-4.26 9.5-9.5 9.5h-7.77c-5.25 0-9.5-4.25-9.5-9.5V46.65c0-.93.35-1.82.98-2.5l4.53-4.92c.19-.2.49-.27.75-.17.26.11.44.36.44.64v20.52c0 1.57 1.28 2.85 2.85 2.85h7.68c1.57 0 2.85-1.28 2.85-2.85V35.8c0-1.57-1.28-2.85-2.85-2.85h-8.93c-1.02 0-2 .43-2.7 1.18L28.35 63.06h16c.92 0 1.67.75 1.67 1.68v3.34c0 .93-.75 1.67-1.67 1.67H22.79c-1.95 0-3.55-1.59-3.55-3.54v-1.77c0-.89.33-1.75.94-2.4l29.86-32.43c1.98-2.15 4.75-3.36 7.67-3.36h8.93c5.25 0 9.5 4.25 9.5 9.5v24.5z"/>
</svg>`;

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
      box-shadow: 2px 4px 16px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04);
      padding: 32px;
      width: 400px;
      max-width: calc(100vw - 32px);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }
    .logo { margin-bottom: 4px; }
    .icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .icon-success { background: #f0faf0; }
    .icon-error { background: #fef0f0; }
    .icon svg { width: 24px; height: 24px; }
    h2 {
      font-size: 1.23rem;
      font-weight: 600;
      color: #333;
    }
    p {
      font-size: 0.92rem;
      color: #666;
      text-align: center;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">${TWENTY_LOGO_SVG}</div>
    <div class="icon ${isSuccess ? 'icon-success' : 'icon-error'}">
      ${
        isSuccess
          ? '<svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
          : '<svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
      }
    </div>
    <h2>${title}</h2>
    <p>${message}</p>
  </div>
</body>
</html>`;

const SUCCESS_HTML = pageHtml({
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
        res.end(SUCCESS_HTML);
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
