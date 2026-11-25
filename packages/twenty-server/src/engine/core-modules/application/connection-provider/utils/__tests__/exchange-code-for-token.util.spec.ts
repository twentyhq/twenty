import { exchangeCodeForToken } from 'src/engine/core-modules/application/connection-provider/utils/exchange-code-for-token.util';
import { exchangeRefreshTokenForToken } from 'src/engine/core-modules/application/connection-provider/utils/exchange-refresh-token-for-token.util';
import { type ResolvedOAuthClient } from 'src/engine/core-modules/application/connection-provider/types/resolved-oauth-client.type';

type FetchCall = [
  url: string,
  init: { headers: Record<string, string>; body: string },
];

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

const CLIENT: ResolvedOAuthClient = {
  authorizationEndpoint: 'https://example.com/authorize',
  tokenEndpoint: 'https://example.com/token',
  clientId: 'cid',
  clientSecret: 'csec',
  tokenEndpointAuthMethod: 'client_secret_post',
  scopes: ['read'],
  resource: null,
  authorizationParams: null,
  tokenRequestContentType: 'form-urlencoded',
  shouldUsePkce: false,
};

const baseExchangeArgs = {
  client: CLIENT,
  code: 'c',
  redirectUri: 'https://example.com/cb',
  codeVerifier: null,
};

describe('exchangeCodeForToken', () => {
  it('POSTs form-urlencoded with the OAuth2 standard fields and parses the response', async () => {
    const fetchFn = jest.fn<Promise<Response>, FetchCall>(async () =>
      buildResponse({
        access_token: 'lin_access',
        refresh_token: 'lin_refresh',
        expires_in: 315360000,
        scope: 'read write',
      }),
    );

    const result = await exchangeCodeForToken({
      ...baseExchangeArgs,
      fetchFn,
      codeVerifier: 'verifier_123',
    });

    expect(result).toEqual({
      accessToken: 'lin_access',
      refreshToken: 'lin_refresh',
      idToken: null,
      scopes: ['read', 'write'],
      accessTokenExpiresAt: expect.any(Date),
    });

    const init = fetchFn.mock.calls[0][1];

    expect(init.headers['Content-Type']).toBe(
      'application/x-www-form-urlencoded',
    );

    const params = new URLSearchParams(init.body);

    expect(params.get('grant_type')).toBe('authorization_code');
    expect(params.get('code')).toBe('c');
    expect(params.get('client_id')).toBe('cid');
    expect(params.get('client_secret')).toBe('csec');
    expect(params.get('code_verifier')).toBe('verifier_123');
    expect(params.has('resource')).toBe(false);
  });

  it('omits the secret for a public client and binds the token to the resource', async () => {
    const fetchFn = jest.fn<Promise<Response>, FetchCall>(async () =>
      buildResponse({ access_token: 'a' }),
    );

    await exchangeCodeForToken({
      ...baseExchangeArgs,
      client: {
        ...CLIENT,
        clientSecret: null,
        resource: 'https://mcp.example.com/mcp',
      },
      fetchFn,
    });

    const params = new URLSearchParams(fetchFn.mock.calls[0][1].body);

    expect(params.has('client_secret')).toBe(false);
    expect(params.get('resource')).toBe('https://mcp.example.com/mcp');
  });

  it('sends the credentials in a Basic header for a client_secret_basic client', async () => {
    const fetchFn = jest.fn<Promise<Response>, FetchCall>(async () =>
      buildResponse({ access_token: 'a' }),
    );

    await exchangeCodeForToken({
      ...baseExchangeArgs,
      client: {
        ...CLIENT,
        clientId: 'c id',
        clientSecret: 's:c/ret',
        tokenEndpointAuthMethod: 'client_secret_basic',
      },
      fetchFn,
    });

    const init = fetchFn.mock.calls[0][1];
    const params = new URLSearchParams(init.body);

    expect(init.headers.Authorization).toBe(
      `Basic ${Buffer.from('c+id:s%3Ac%2Fret').toString('base64')}`,
    );
    expect(params.has('client_id')).toBe(false);
    expect(params.has('client_secret')).toBe(false);
  });

  it('keeps the secret out of the request when the client registered as public', async () => {
    const fetchFn = jest.fn<Promise<Response>, FetchCall>(async () =>
      buildResponse({ access_token: 'a' }),
    );

    await exchangeCodeForToken({
      ...baseExchangeArgs,
      client: { ...CLIENT, tokenEndpointAuthMethod: 'none' },
      fetchFn,
    });

    const init = fetchFn.mock.calls[0][1];
    const params = new URLSearchParams(init.body);

    expect(init.headers.Authorization).toBeUndefined();
    expect(params.get('client_id')).toBe('cid');
    expect(params.has('client_secret')).toBe(false);
  });

  it('POSTs JSON when contentType is json', async () => {
    const fetchFn = jest.fn<Promise<Response>, FetchCall>(async () =>
      buildResponse({ access_token: 'a', refresh_token: 'r' }),
    );

    await exchangeCodeForToken({
      ...baseExchangeArgs,
      client: { ...CLIENT, tokenRequestContentType: 'json' },
      fetchFn,
    });

    const init = fetchFn.mock.calls[0][1];

    expect(init.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(init.body)).toMatchObject({
      grant_type: 'authorization_code',
      code: 'c',
    });
  });

  it('throws on non-2xx response', async () => {
    const fetchFn = jest.fn<Promise<Response>, FetchCall>(async () =>
      buildResponse({ error: 'invalid_grant' }, { ok: false, status: 400 }),
    );

    await expect(
      exchangeCodeForToken({
        ...baseExchangeArgs,
        fetchFn,
      }),
    ).rejects.toThrow(/400/);
  });

  it('throws when 200 response is missing access_token', async () => {
    const fetchFn = jest.fn<Promise<Response>, FetchCall>(async () =>
      buildResponse({ refresh_token: 'r' }),
    );

    await expect(
      exchangeCodeForToken({
        ...baseExchangeArgs,
        fetchFn,
      }),
    ).rejects.toThrow(/access_token/);
  });
});

describe('exchangeRefreshTokenForToken', () => {
  const baseRefreshArgs = { client: CLIENT, refreshToken: 'old_refresh' };

  it('uses grant_type=refresh_token and returns the rotated tokens', async () => {
    const fetchFn = jest.fn<Promise<Response>, FetchCall>(async () =>
      buildResponse({
        access_token: 'new_access',
        refresh_token: 'new_refresh',
      }),
    );

    const result = await exchangeRefreshTokenForToken({
      ...baseRefreshArgs,
      fetchFn,
    });

    expect(result).toEqual({
      accessToken: 'new_access',
      refreshToken: 'new_refresh',
      idToken: null,
      scopes: null,
      accessTokenExpiresAt: null,
    });

    const init = fetchFn.mock.calls[0][1];
    const params = new URLSearchParams(init.body);

    expect(params.get('grant_type')).toBe('refresh_token');
    expect(params.get('refresh_token')).toBe('old_refresh');
  });

  it('returns refreshToken=null when the provider omits it (caller applies fallback)', async () => {
    const fetchFn = jest.fn<Promise<Response>, FetchCall>(async () =>
      buildResponse({ access_token: 'new_access' }),
    );

    const result = await exchangeRefreshTokenForToken({
      ...baseRefreshArgs,
      fetchFn,
    });

    expect(result.refreshToken).toBeNull();
  });
});
