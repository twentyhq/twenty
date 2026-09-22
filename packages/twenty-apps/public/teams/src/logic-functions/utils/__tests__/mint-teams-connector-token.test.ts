import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { mintTeamsConnectorToken } from 'src/logic-functions/utils/mint-teams-connector-token';
import { TEAMS_TEST_BOT_CREDENTIALS } from 'src/__tests__/constants/teams-test-bot-credentials.constant';

const fetchMock = vi.fn();

const buildResponse = (body: unknown) => ({
  ok: true,
  status: 200,
  statusText: 'OK',
  json: async () => body,
});

describe('mintTeamsConnectorToken', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', fetchMock);
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('should post client credentials to the tenant scoped token endpoint', async () => {
    fetchMock.mockResolvedValue(
      buildResponse({ access_token: 'minted', expires_in: 3599 }),
    );

    const token = await mintTeamsConnectorToken(TEAMS_TEST_BOT_CREDENTIALS);

    expect(token).toEqual({
      accessToken: 'minted',
      expiresAtMs: Date.now() + 3599 * 1000,
    });

    const [url, options] = fetchMock.mock.calls[0];

    expect(url).toBe(
      `https://login.microsoftonline.com/${TEAMS_TEST_BOT_CREDENTIALS.tenantId}/oauth2/v2.0/token`,
    );
    expect(options.method).toBe('POST');
    expect(Object.fromEntries(options.body)).toEqual({
      grant_type: 'client_credentials',
      client_id: TEAMS_TEST_BOT_CREDENTIALS.appId,
      client_secret: TEAMS_TEST_BOT_CREDENTIALS.appPassword,
      scope: 'https://api.botframework.com/.default',
    });
  });

  it('should throw without leaking the client secret when Entra rejects the request', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({}),
    });

    await expect(
      mintTeamsConnectorToken(TEAMS_TEST_BOT_CREDENTIALS),
    ).rejects.toThrow('Failed to mint a Bot Connector token: 401 Unauthorized');
  });

  it('should throw when the response carries no access token', async () => {
    fetchMock.mockResolvedValue(buildResponse({ expires_in: 3599 }));

    await expect(
      mintTeamsConnectorToken(TEAMS_TEST_BOT_CREDENTIALS),
    ).rejects.toThrow('carried no access_token');
  });

  it('should throw rather than guess a lifetime when expires_in is missing', async () => {
    fetchMock.mockResolvedValue(buildResponse({ access_token: 'minted' }));

    await expect(
      mintTeamsConnectorToken(TEAMS_TEST_BOT_CREDENTIALS),
    ).rejects.toThrow('carried no expires_in');
  });
});
