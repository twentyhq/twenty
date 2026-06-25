import http from 'node:http';

import { startCallbackServer } from '../callback-server';

const httpGet = (
  url: string,
): Promise<{
  status: number;
  body: string;
  headers: http.IncomingHttpHeaders;
}> =>
  new Promise((resolve, reject) => {
    http
      .get(url, (res) => {
        let body = '';

        res.on('data', (chunk: string) => (body += chunk));
        res.on('end', () =>
          resolve({
            status: res.statusCode ?? 0,
            body,
            headers: res.headers,
          }),
        );
      })
      .on('error', reject);
  });

describe('startCallbackServer', () => {
  it('should start on a random port and provide a callback URL', async () => {
    const server = await startCallbackServer();

    try {
      expect(server.port).toBeGreaterThan(0);
      expect(server.callbackUrl).toBe(
        `http://127.0.0.1:${server.port}/callback`,
      );
    } finally {
      server.close();
    }
  });

  it('should resolve with the authorization code on successful callback', async () => {
    const server = await startCallbackServer();

    try {
      const waitPromise = server.waitForCallback();

      await httpGet(`${server.callbackUrl}?code=test-auth-code`);

      const result = await waitPromise;

      expect(result).toEqual({ success: true, code: 'test-auth-code' });
    } finally {
      server.close();
    }
  });

  it('should send the success page with an explicit Content-Length (not chunked)', async () => {
    const server = await startCallbackServer();

    try {
      const waitPromise = server.waitForCallback();

      const response = await httpGet(
        `${server.callbackUrl}?code=test-auth-code`,
      );

      await waitPromise;

      expect(response.status).toBe(200);
      expect(response.headers['transfer-encoding']).toBeUndefined();
      expect(response.headers['content-length']).toBe(
        String(Buffer.byteLength(response.body)),
      );
      expect(response.body).toContain('Authentication successful');
    } finally {
      server.close();
    }
  });

  it('should deliver the full page even when the server is closed right after the callback resolves', async () => {
    const server = await startCallbackServer();

    const responsePromise = httpGet(
      `${server.callbackUrl}?code=test-auth-code`,
    );

    await server.waitForCallback();
    server.close();

    const response = await responsePromise;

    expect(response.status).toBe(200);
    expect(response.body).toContain('Authentication successful');
    expect(response.body).toContain('</html>');
  });

  it('should resolve with error when callback contains an error', async () => {
    const server = await startCallbackServer();

    try {
      const waitPromise = server.waitForCallback();

      await httpGet(`${server.callbackUrl}?error=access_denied`);

      const result = await waitPromise;

      expect(result).toEqual({ success: false, error: 'access_denied' });
    } finally {
      server.close();
    }
  });

  it('should return 404 for non-callback paths', async () => {
    const server = await startCallbackServer();

    try {
      const response = await httpGet(
        `http://127.0.0.1:${server.port}/other-path`,
      );

      expect(response.status).toBe(404);
    } finally {
      server.close();
    }
  });

  it('should time out if no callback is received', async () => {
    const server = await startCallbackServer({ timeoutMs: 500 });

    try {
      const result = await server.waitForCallback();

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error).toContain('Timed out');
      }
    } finally {
      server.close();
    }
  });
});
