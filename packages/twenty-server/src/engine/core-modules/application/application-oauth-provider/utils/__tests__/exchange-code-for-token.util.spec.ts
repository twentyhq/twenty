import { exchangeCodeForToken } from 'src/engine/core-modules/application/application-oauth-provider/utils/exchange-code-for-token.util';
import { exchangeRefreshTokenForToken } from 'src/engine/core-modules/application/application-oauth-provider/utils/exchange-refresh-token-for-token.util';

const buildResponse = (
  json: unknown,
  options: { ok?: boolean; status?: number } = {},
): Response =>
  ({
    ok: options.ok ?? true,
    status: options.status ?? 200,
    json: async () => json,
    text: async () => JSON.stringify(json),
  }) as Response;

const baseExchangeArgs = {
  tokenEndpoint: 'https://example.com/token',
  contentType: 'form-urlencoded' as const,
  clientId: 'cid',
  clientSecret: 'csec',
  code: 'c',
  redirectUri: 'https://example.com/cb',
  codeVerifier: null,
};

describe('exchangeCodeForToken', () => {
  it('POSTs form-urlencoded with the OAuth2 standard fields and parses the response', async () => {
    const fetchFn = jest.fn(async () =>
      buildResponse({
        access_token: 'lin_access',
        refresh_token: 'lin_refresh',
        expires_in: 315360000,
        scope: 'read write',
      }),
    );

    const result = await exchangeCodeForToken({
      ...baseExchangeArgs,
      fetchFn: fetchFn as unknown as typeof globalThis.fetch,
      codeVerifier: 'verifier_123',
    });

    expect(result).toEqual({
      accessToken: 'lin_access',
      refreshToken: 'lin_refresh',
      scopes: ['read', 'write'],
    });

    const init = (
      fetchFn.mock.calls[0] as unknown as [
        string,
        { headers: Record<string, string>; body: string },
      ]
    )[1];

    expect(init.headers['Content-Type']).toBe(
      'application/x-www-form-urlencoded',
    );

    const params = new URLSearchParams(init.body);

    expect(params.get('grant_type')).toBe('authorization_code');
    expect(params.get('code')).toBe('c');
    expect(params.get('client_id')).toBe('cid');
    expect(params.get('client_secret')).toBe('csec');
    expect(params.get('code_verifier')).toBe('verifier_123');
  });

  it('POSTs JSON when contentType is json', async () => {
    const fetchFn = jest.fn(async () =>
      buildResponse({ access_token: 'a', refresh_token: 'r' }),
    );

    await exchangeCodeForToken({
      ...baseExchangeArgs,
      contentType: 'json',
      fetchFn: fetchFn as unknown as typeof globalThis.fetch,
    });

    const init = (
      fetchFn.mock.calls[0] as unknown as [
        string,
        { headers: Record<string, string>; body: string },
      ]
    )[1];

    expect(init.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(init.body)).toMatchObject({
      grant_type: 'authorization_code',
      code: 'c',
    });
  });

  it('throws on non-2xx response', async () => {
    const fetchFn = jest.fn(async () =>
      buildResponse({ error: 'invalid_grant' }, { ok: false, status: 400 }),
    );

    await expect(
      exchangeCodeForToken({
        ...baseExchangeArgs,
        fetchFn: fetchFn as unknown as typeof globalThis.fetch,
      }),
    ).rejects.toThrow(/400/);
  });

  it('throws when 200 response is missing access_token', async () => {
    const fetchFn = jest.fn(async () => buildResponse({ refresh_token: 'r' }));

    await expect(
      exchangeCodeForToken({
        ...baseExchangeArgs,
        fetchFn: fetchFn as unknown as typeof globalThis.fetch,
      }),
    ).rejects.toThrow(/access_token/);
  });
});

describe('exchangeRefreshTokenForToken', () => {
  const baseRefreshArgs = {
    tokenEndpoint: 'https://example.com/token',
    contentType: 'form-urlencoded' as const,
    clientId: 'cid',
    clientSecret: 'csec',
    refreshToken: 'old_refresh',
  };

  it('uses grant_type=refresh_token and returns the rotated tokens', async () => {
    const fetchFn = jest.fn(async () =>
      buildResponse({
        access_token: 'new_access',
        refresh_token: 'new_refresh',
      }),
    );

    const result = await exchangeRefreshTokenForToken({
      ...baseRefreshArgs,
      fetchFn: fetchFn as unknown as typeof globalThis.fetch,
    });

    expect(result).toEqual({
      accessToken: 'new_access',
      refreshToken: 'new_refresh',
      scopes: null,
    });

    const init = (
      fetchFn.mock.calls[0] as unknown as [string, { body: string }]
    )[1];
    const params = new URLSearchParams(init.body);

    expect(params.get('grant_type')).toBe('refresh_token');
    expect(params.get('refresh_token')).toBe('old_refresh');
  });

  it('returns refreshToken=null when the provider omits it (caller applies fallback)', async () => {
    const fetchFn = jest.fn(async () =>
      buildResponse({ access_token: 'new_access' }),
    );

    const result = await exchangeRefreshTokenForToken({
      ...baseRefreshArgs,
      fetchFn: fetchFn as unknown as typeof globalThis.fetch,
    });

    expect(result.refreshToken).toBeNull();
  });
});
