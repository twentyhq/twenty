import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  connectOAuth,
  getDesktopSetupUrl,
  getDesktopInstallationUrl,
  validateServerUrl,
} from '../oauth';

const servers: ReturnType<typeof createServer>[] = [];
afterEach(async () => {
  vi.unstubAllGlobals();
  await Promise.all(
    servers.splice(0).map(
      (server) =>
        new Promise<void>((resolve) => {
          server.closeAllConnections();
          server.close(() => resolve());
        }),
    ),
  );
});

describe('Twenty OAuth', () => {
  it('links to the integration installation page on the discovered frontend', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            issuer: 'https://api.twenty.com',
            authorization_endpoint: 'https://app.twenty.com/authorize',
          }),
        ),
      ),
    );
    await expect(
      getDesktopInstallationUrl('https://api.twenty.com'),
    ).resolves.toBe(
      'https://app.twenty.com/settings/applications/available/8bdaaa9f-dc53-4247-a89b-aa386c9b3244',
    );
  });
  it('does not open the browser or register an app when desktop discovery is missing', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          issuer: 'https://api.twenty.com',
          authorization_endpoint: 'https://app.twenty.com/authorize',
        }),
      ),
    );
    vi.stubGlobal('fetch', fetchMock);
    const openBrowser = vi.fn();
    await expect(
      connectOAuth('https://api.twenty.com', openBrowser),
    ).rejects.toThrow('Install it to continue');
    expect(openBrowser).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('opens setup on the discovered frontend when the input is an API host', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            issuer: 'https://api.twenty.com',
            authorization_endpoint:
              'https://app.twenty.com/authorize?iss=https%3A%2F%2Fapi.twenty.com',
          }),
        ),
      ),
    );
    await expect(getDesktopSetupUrl('https://api.twenty.com')).resolves.toBe(
      'https://app.twenty.com/settings/desktop-app',
    );
  });
  it('uses the installed integration client with state validation and PKCE through real HTTP boundaries', async () => {
    let origin = '';
    let challenge = '';
    let issuedToken = false;
    const server = createServer(async (request, response) => {
      const chunks: Buffer[] = [];
      for await (const chunk of request) chunks.push(Buffer.from(chunk));
      const body = Buffer.concat(chunks).toString();
      response.setHeader('Content-Type', 'application/json');
      if (request.url === '/.well-known/oauth-authorization-server')
        response.end(
          JSON.stringify({
            issuer: origin,
            desktop_client_id: 'desktop-client',
            authorization_endpoint: `${origin}/authorize?iss=${encodeURIComponent(origin)}`,
            authorization_response_iss_parameter_supported: true,
          }),
        );
      else if (request.url === '/oauth/register') {
        throw new Error('Desktop sign-in must not register an OAuth-only app');
      } else if (request.url === '/oauth/token') {
        const parameters = new URLSearchParams(body);
        expect(parameters.get('client_secret')).toBeNull();
        expect(parameters.get('client_id')).toBe('desktop-client');
        expect(
          createHash('sha256')
            .update(parameters.get('code_verifier') ?? '')
            .digest('base64url'),
        ).toBe(challenge);
        expect(parameters.get('code')).toBe('test-code');
        issuedToken = true;
        response.end(
          JSON.stringify({
            access_token: 'access',
            refresh_token: 'refresh',
            expires_in: 3600,
          }),
        );
      } else response.writeHead(404).end('{}');
    });
    servers.push(server);
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );
    const address = server.address();
    if (!address || typeof address === 'string')
      throw new Error('Missing address');
    origin = `http://127.0.0.1:${address.port}`;
    const credentials = await connectOAuth(origin, async (value) => {
      const authorization = new URL(value);
      expect(authorization.pathname).toBe('/authorize');
      expect(authorization.searchParams.get('iss')).toBe(origin);
      challenge = authorization.searchParams.get('code_challenge') ?? '';
      const callback = new URL(
        authorization.searchParams.get('redirect_uri') ?? '',
      );
      callback.search = new URLSearchParams({
        state: 'wrong',
        code: 'test-code',
        iss: origin,
      }).toString();
      expect((await fetch(callback)).status).toBe(400);
      expect(issuedToken).toBe(false);
      callback.searchParams.set(
        'state',
        authorization.searchParams.get('state') ?? '',
      );
      const response = await fetch(callback);
      expect(response.status).toBe(200);
      expect(response.headers.get('cache-control')).toBe('no-store');
      expect(await response.text()).toBe(
        'Returning to Twenty… You can close this tab.',
      );
    });
    expect(credentials.accessToken).toBe('access');
    expect(issuedToken).toBe(true);
  });
  it('only accepts HTTPS origins and explicit loopback development origins', () => {
    expect(validateServerUrl('https://acme.twenty.com/')).toBe(
      'https://acme.twenty.com',
    );
    expect(validateServerUrl('http://localhost:3000')).toBe(
      'http://localhost:3000',
    );
    for (const url of [
      'http://crm.example.com',
      'https://user:pass@crm.example.com',
      'https://crm.example.com/path',
      'https://crm.example.com?key=secret',
    ])
      expect(() => validateServerUrl(url)).toThrow();
  });
});

it.each(['discovery', 'token'])(
  'cancels a stalled OAuth %s request',
  async (phase) => {
    const controller = new AbortController();
    let origin = '';
    const server = createServer((request, response) => {
      if (phase === 'discovery' || request.url === '/oauth/token') {
        controller.abort();
        return;
      }
      response.setHeader('Content-Type', 'application/json');
      response.end(
        JSON.stringify({
          issuer: origin,
          desktop_client_id: 'desktop',
          authorization_endpoint: `${origin}/authorize`,
        }),
      );
    });
    servers.push(server);
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );
    const address = server.address();
    if (!address || typeof address === 'string')
      throw new Error('Missing address');
    origin = `http://127.0.0.1:${address.port}`;
    const openBrowser = vi.fn(async (url: string) => {
      const authorization = new URL(url);
      const callback = new URL(authorization.searchParams.get('redirect_uri')!);
      callback.searchParams.set(
        'state',
        authorization.searchParams.get('state')!,
      );
      callback.searchParams.set('code', 'code');
      await fetch(callback);
    });
    await expect(
      connectOAuth(origin, openBrowser, controller.signal),
    ).rejects.toMatchObject({ name: 'AbortError' });
    expect(openBrowser).toHaveBeenCalledTimes(phase === 'discovery' ? 0 : 1);
  },
);

it('keeps a request deadline when a caller supplies its own signal', async () => {
  const { requestJson } = await import('../oauth');
  const caller = new AbortController();
  const timeout = new AbortController();
  const deadline = vi
    .spyOn(AbortSignal, 'timeout')
    .mockReturnValue(timeout.signal);
  const server = createServer(() =>
    timeout.abort(new DOMException('Timed out', 'TimeoutError')),
  );
  servers.push(server);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string')
    throw new Error('Missing address');
  try {
    await expect(
      requestJson(`http://127.0.0.1:${address.port}`, {
        signal: caller.signal,
      }),
    ).rejects.toMatchObject({ name: 'TimeoutError' });
    expect(caller.signal.aborted).toBe(false);
  } finally {
    deadline.mockRestore();
  }
});
