import { exchangeCodeForToken } from 'src/engine/core-modules/application/application-oauth-provider/utils/exchange-code-for-token.util';
import { exchangeRefreshTokenForToken } from 'src/engine/core-modules/application/application-oauth-provider/utils/exchange-refresh-token-for-token.util';

const buildResponse = (
  json: unknown,
  options: { ok?: boolean; status?: number } = {},
): Response => {
  const body = JSON.stringify(json);

  return {
    ok: options.ok ?? true,
    status: options.status ?? 200,
    json: async () => json,
    text: async () => body,
  } as Response;
};

describe('exchangeCodeForToken', () => {
  it('POSTs form-urlencoded body when contentType is form-urlencoded (Linear-style)', async () => {
    const fetchFn = jest.fn(async () =>
      buildResponse({
        access_token: 'lin_access',
        refresh_token: 'lin_refresh',
        expires_in: 315360000,
        scope: 'read write',
      }),
    );

    const result = await exchangeCodeForToken({
      fetchFn: fetchFn as unknown as typeof globalThis.fetch,
      tokenEndpoint: 'https://api.linear.app/oauth/token',
      contentType: 'form-urlencoded',
      clientId: 'cid',
      clientSecret: 'csec',
      code: 'auth_code_123',
      redirectUri: 'https://api.example.com/apps/oauth/callback',
      codeVerifier: null,
    });

    expect(result.accessToken).toBe('lin_access');
    expect(result.refreshToken).toBe('lin_refresh');
    expect(result.scopes).toEqual(['read', 'write']);
    expect(result.expiresInMs).toBe(315360000 * 1000);

    expect(fetchFn).toHaveBeenCalledTimes(1);
    const [url, init] = fetchFn.mock.calls[0] as unknown as [
      string,
      { method: string; headers: Record<string, string>; body: string },
    ];

    expect(url).toBe('https://api.linear.app/oauth/token');
    expect(init.method).toBe('POST');
    expect(init.headers['Content-Type']).toBe(
      'application/x-www-form-urlencoded',
    );
    expect(init.headers['Accept']).toBe('application/json');

    const params = new URLSearchParams(init.body);

    expect(params.get('grant_type')).toBe('authorization_code');
    expect(params.get('code')).toBe('auth_code_123');
    expect(params.get('client_id')).toBe('cid');
    expect(params.get('client_secret')).toBe('csec');
    expect(params.get('redirect_uri')).toBe(
      'https://api.example.com/apps/oauth/callback',
    );
    expect(params.get('code_verifier')).toBeNull();
  });

  it('includes code_verifier when PKCE is in use', async () => {
    const fetchFn = jest.fn(async () =>
      buildResponse({ access_token: 'a', refresh_token: 'r' }),
    );

    await exchangeCodeForToken({
      fetchFn: fetchFn as unknown as typeof globalThis.fetch,
      tokenEndpoint: 'https://example.com/token',
      contentType: 'form-urlencoded',
      clientId: 'cid',
      clientSecret: 'csec',
      code: 'c',
      redirectUri: 'https://example.com/cb',
      codeVerifier: 'verifier_123',
    });

    const init = (fetchFn.mock.calls[0] as unknown as [string, { body: string }])[1];
    const params = new URLSearchParams(init.body);

    expect(params.get('code_verifier')).toBe('verifier_123');
  });

  it('POSTs JSON body when contentType is json', async () => {
    const fetchFn = jest.fn(async () =>
      buildResponse({ access_token: 'a', refresh_token: 'r' }),
    );

    await exchangeCodeForToken({
      fetchFn: fetchFn as unknown as typeof globalThis.fetch,
      tokenEndpoint: 'https://example.com/token',
      contentType: 'json',
      clientId: 'cid',
      clientSecret: 'csec',
      code: 'c',
      redirectUri: 'https://example.com/cb',
      codeVerifier: null,
    });

    const init = (fetchFn.mock.calls[0] as unknown as [
      string,
      { headers: Record<string, string>; body: string },
    ])[1];

    expect(init.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(init.body)).toMatchObject({
      grant_type: 'authorization_code',
      code: 'c',
    });
  });

  it('throws when the provider returns a non-2xx response', async () => {
    const fetchFn = jest.fn(async () =>
      buildResponse({ error: 'invalid_grant' }, { ok: false, status: 400 }),
    );

    await expect(
      exchangeCodeForToken({
        fetchFn: fetchFn as unknown as typeof globalThis.fetch,
        tokenEndpoint: 'https://example.com/token',
        contentType: 'form-urlencoded',
        clientId: 'cid',
        clientSecret: 'csec',
        code: 'c',
        redirectUri: 'https://example.com/cb',
        codeVerifier: null,
      }),
    ).rejects.toThrow(/400/);
  });

  it('throws when the provider returns 200 but no access_token', async () => {
    const fetchFn = jest.fn(async () =>
      buildResponse({ refresh_token: 'r' }),
    );

    await expect(
      exchangeCodeForToken({
        fetchFn: fetchFn as unknown as typeof globalThis.fetch,
        tokenEndpoint: 'https://example.com/token',
        contentType: 'form-urlencoded',
        clientId: 'cid',
        clientSecret: 'csec',
        code: 'c',
        redirectUri: 'https://example.com/cb',
        codeVerifier: null,
      }),
    ).rejects.toThrow(/access_token/);
  });
});

describe('exchangeRefreshTokenForToken', () => {
  it('returns rotated refresh_token when the provider rotates', async () => {
    const fetchFn = jest.fn(async () =>
      buildResponse({
        access_token: 'new_access',
        refresh_token: 'new_refresh',
      }),
    );

    const result = await exchangeRefreshTokenForToken({
      fetchFn: fetchFn as unknown as typeof globalThis.fetch,
      tokenEndpoint: 'https://example.com/token',
      contentType: 'form-urlencoded',
      clientId: 'cid',
      clientSecret: 'csec',
      refreshToken: 'old_refresh',
    });

    expect(result.accessToken).toBe('new_access');
    expect(result.refreshToken).toBe('new_refresh');
  });

  it('returns refreshToken=null when the provider omits it; service layer applies the rotation fallback', async () => {
    const fetchFn = jest.fn(async () =>
      buildResponse({ access_token: 'new_access' }),
    );

    const result = await exchangeRefreshTokenForToken({
      fetchFn: fetchFn as unknown as typeof globalThis.fetch,
      tokenEndpoint: 'https://example.com/token',
      contentType: 'form-urlencoded',
      clientId: 'cid',
      clientSecret: 'csec',
      refreshToken: 'old_refresh',
    });

    expect(result.accessToken).toBe('new_access');
    expect(result.refreshToken).toBeNull();
  });

  it('uses grant_type=refresh_token in the request body', async () => {
    const fetchFn = jest.fn(async () =>
      buildResponse({ access_token: 'a' }),
    );

    await exchangeRefreshTokenForToken({
      fetchFn: fetchFn as unknown as typeof globalThis.fetch,
      tokenEndpoint: 'https://example.com/token',
      contentType: 'form-urlencoded',
      clientId: 'cid',
      clientSecret: 'csec',
      refreshToken: 'r',
    });

    const init = (fetchFn.mock.calls[0] as unknown as [string, { body: string }])[1];
    const params = new URLSearchParams(init.body);

    expect(params.get('grant_type')).toBe('refresh_token');
    expect(params.get('refresh_token')).toBe('r');
  });
});
