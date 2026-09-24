import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { requestTeamsConnector } from 'src/features/chat/logic-functions/utils/request-teams-connector';

const SERVICE_URL = 'https://smba.trafficmanager.net/amer/';
const ACCESS_TOKEN = 'connector-access-token';

const fetchMock = vi.fn();

const buildResponse = ({
  ok = true,
  status = 200,
  statusText = 'OK',
  body = '',
}: {
  ok?: boolean;
  status?: number;
  statusText?: string;
  body?: string;
} = {}) => ({ ok, status, statusText, text: async () => body });

describe('requestTeamsConnector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchMock.mockResolvedValue(buildResponse());
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should call the normalized service url with the bearer token', async () => {
    await requestTeamsConnector({
      serviceUrl: SERVICE_URL,
      path: '/v3/conversations/a/activities/b',
      method: 'DELETE',
      accessToken: ACCESS_TOKEN,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://smba.trafficmanager.net/amer/v3/conversations/a/activities/b',
      {
        method: 'DELETE',
        headers: { authorization: `Bearer ${ACCESS_TOKEN}` },
      },
    );
  });

  it('should send a JSON body and content type when an activity is given', async () => {
    await requestTeamsConnector({
      serviceUrl: SERVICE_URL,
      path: '/v3/conversations/a/activities',
      method: 'POST',
      accessToken: ACCESS_TOKEN,
      body: { type: 'message', text: 'Hello' },
    });

    expect(fetchMock).toHaveBeenCalledWith(expect.any(String), {
      method: 'POST',
      headers: {
        authorization: `Bearer ${ACCESS_TOKEN}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ type: 'message', text: 'Hello' }),
    });
  });

  it('should refuse to send the bot credentials to a host outside the Bot Connector', async () => {
    await expect(
      requestTeamsConnector({
        serviceUrl: 'https://attacker.example',
        path: '/v3/conversations/a/activities',
        method: 'POST',
        accessToken: ACCESS_TOKEN,
        body: { type: 'message', text: 'Hello' },
      }),
    ).rejects.toThrow('not a Bot Connector host');

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('should refuse a look-alike host that only ends with the Bot Connector domain', async () => {
    await expect(
      requestTeamsConnector({
        serviceUrl: 'https://smba.trafficmanager.net.attacker.example',
        path: '/v3/conversations/a/activities',
        method: 'POST',
        accessToken: ACCESS_TOKEN,
      }),
    ).rejects.toThrow('not a Bot Connector host');

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('should surface the Bot Connector error body on a failed request', async () => {
    fetchMock.mockResolvedValue(
      buildResponse({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        body: '{"error":{"code":"BotNotInConversationRoster"}}',
      }),
    );

    await expect(
      requestTeamsConnector({
        serviceUrl: SERVICE_URL,
        path: '/v3/conversations/a/activities',
        method: 'POST',
        accessToken: ACCESS_TOKEN,
      }),
    ).rejects.toThrow(
      '403 Forbidden - {"error":{"code":"BotNotInConversationRoster"}}',
    );
  });
});
