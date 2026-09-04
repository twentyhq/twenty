import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getGraphAccessToken } from 'src/logic-functions/utils/get-graph-access-token.util';

const sdkMocks = vi.hoisted(() => ({
  kvGet: vi.fn(),
  kvSet: vi.fn(),
}));

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<typeof import('twenty-sdk/logic-function')>()),
  kv: { get: sdkMocks.kvGet, set: sdkMocks.kvSet, delete: vi.fn() },
}));

describe('getGraphAccessToken', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('MICROSOFT_TENANT_ID', 'tenant-1');
    vi.stubEnv('MICROSOFT_CLIENT_ID', 'client-1');
    vi.stubEnv('MICROSOFT_CLIENT_SECRET', 'secret-1');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('reuses a cached token that is not about to expire', async () => {
    sdkMocks.kvGet.mockResolvedValue({
      accessToken: 'cached',
      expiresAt: Date.now() + 60 * 60 * 1_000,
    });

    expect(await getGraphAccessToken()).toBe('cached');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('requests a client-credentials token and caches it', async () => {
    sdkMocks.kvGet.mockResolvedValue({
      accessToken: 'stale',
      expiresAt: Date.now() + 60 * 1_000,
    });
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ access_token: 'fresh', expires_in: 3_599 }), {
        status: 200,
      }),
    );

    expect(await getGraphAccessToken()).toBe('fresh');

    const [url, init] = fetchMock.mock.calls[0];
    const body = init.body as URLSearchParams;

    expect(url).toBe(
      'https://login.microsoftonline.com/tenant-1/oauth2/v2.0/token',
    );
    expect(body.get('grant_type')).toBe('client_credentials');
    expect(body.get('client_id')).toBe('client-1');
    expect(body.get('scope')).toBe('https://graph.microsoft.com/.default');
    expect(sdkMocks.kvSet).toHaveBeenCalledWith(
      'teams-graph-access-token',
      expect.objectContaining({ accessToken: 'fresh' }),
    );
  });

  it('fails clearly when Microsoft rejects the credentials', async () => {
    sdkMocks.kvGet.mockResolvedValue(null);
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          error: 'invalid_client',
          error_description: 'AADSTS7000215: Invalid client secret provided.',
        }),
        { status: 401 },
      ),
    );

    await expect(getGraphAccessToken()).rejects.toThrow(
      'AADSTS7000215: Invalid client secret provided.',
    );
    expect(sdkMocks.kvSet).not.toHaveBeenCalled();
  });

  it('fails clearly when a variable is missing', async () => {
    vi.stubEnv('MICROSOFT_CLIENT_SECRET', '');
    sdkMocks.kvGet.mockResolvedValue(null);

    await expect(getGraphAccessToken()).rejects.toThrow(
      'MICROSOFT_CLIENT_SECRET is not set',
    );
  });
});
