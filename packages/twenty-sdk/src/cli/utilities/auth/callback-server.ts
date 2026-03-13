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

const SUCCESS_HTML = `<!DOCTYPE html>
<html><body style="font-family:sans-serif;text-align:center;padding:60px">
<h2>Authentication successful</h2>
<p>You can close this window and return to the terminal.</p>
</body></html>`;

const ERROR_HTML = (error: string) => `<!DOCTYPE html>
<html><body style="font-family:sans-serif;text-align:center;padding:60px">
<h2>Authentication failed</h2>
<p>${error}</p>
<p>Please return to the terminal and try again.</p>
</body></html>`;

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

      if (code) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(SUCCESS_HTML);
        callbackResolve({ success: true, code });
      } else {
        const errorMessage =
          error ?? url.searchParams.get('error_description') ?? 'Unknown error';

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(ERROR_HTML(errorMessage));
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
          server.close();
        },
      });
    });

    server.on('error', reject);
  });
};
