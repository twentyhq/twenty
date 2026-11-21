import { isDefined } from 'twenty-sdk/utils';
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
  retryAfter,
}: {
  ok?: boolean;
  status?: number;
  statusText?: string;
  body?: string;
  retryAfter?: string;
} = {}) => ({
  ok,
  status,
  statusText,
  headers: new Headers(
    isDefined(retryAfter) ? { 'retry-after': retryAfter } : {},
  ),
  text: async () => body,
});

const buildUnavailableResponse = (retryAfter?: string) =>
  buildResponse({
    ok: false,
    status: 503,
    statusText: 'Service Unavailable',
    retryAfter,
  });

const POST_REQUEST: Parameters<typeof requestTeamsConnector>[0] = {
  serviceUrl: SERVICE_URL,
  path: '/v3/conversations/a/activities',
  method: 'POST',
  accessToken: ACCESS_TOKEN,
  body: { type: 'message', text: 'Hello' },
};

describe('requestTeamsConnector', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(buildResponse());
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(Math, 'random').mockReturnValue(0);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
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
        signal: expect.any(AbortSignal),
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
      signal: expect.any(AbortSignal),
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

  it('should retry a throttled request with a growing delay until it succeeds', async () => {
    fetchMock
      .mockResolvedValueOnce(
        buildResponse({ ok: false, status: 429, statusText: 'Too Many' }),
      )
      .mockResolvedValueOnce(buildUnavailableResponse())
      .mockResolvedValueOnce(buildResponse({ body: '{"id":"activity-1"}' }));

    const request = requestTeamsConnector(POST_REQUEST);

    await vi.advanceTimersByTimeAsync(999);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(1_999);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(1);

    await expect(request).resolves.toBe('{"id":"activity-1"}');
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('should add jitter on top of the backoff delay', async () => {
    vi.mocked(Math.random).mockReturnValue(1);
    fetchMock
      .mockResolvedValueOnce(buildUnavailableResponse())
      .mockResolvedValueOnce(buildResponse());

    const request = requestTeamsConnector(POST_REQUEST);

    await vi.advanceTimersByTimeAsync(1_249);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);
    await request;

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it.each([412, 429, 503])(
    'should give up on a %i after three attempts and report the last status',
    async (status) => {
      fetchMock
        .mockResolvedValueOnce(buildUnavailableResponse())
        .mockResolvedValue(
          buildResponse({
            ok: false,
            status,
            statusText: 'Still Failing',
            body: 'try later',
          }),
        );

      const failure = expect(
        requestTeamsConnector(POST_REQUEST),
      ).rejects.toThrow(
        `Bot Connector POST /v3/conversations/a/activities failed: ${status} Still Failing - try later`,
      );

      await vi.advanceTimersByTimeAsync(60_000);
      await failure;

      expect(fetchMock).toHaveBeenCalledTimes(3);
    },
  );

  it('should wait for the Retry-After seconds before retrying', async () => {
    fetchMock
      .mockResolvedValueOnce(buildUnavailableResponse('3'))
      .mockResolvedValueOnce(buildResponse());

    const request = requestTeamsConnector(POST_REQUEST);

    await vi.advanceTimersByTimeAsync(2_999);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);
    await request;

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('should wait until the Retry-After date before retrying', async () => {
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    fetchMock
      .mockResolvedValueOnce(
        buildUnavailableResponse('Thu, 01 Jan 2026 00:00:02 GMT'),
      )
      .mockResolvedValueOnce(buildResponse());

    const request = requestTeamsConnector(POST_REQUEST);

    await vi.advanceTimersByTimeAsync(1_999);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);
    await request;

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('should not retry when Retry-After asks for longer than the wait budget', async () => {
    fetchMock.mockResolvedValue(buildUnavailableResponse('120'));

    await expect(requestTeamsConnector(POST_REQUEST)).rejects.toThrow(
      '503 Service Unavailable',
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each([
    [502, 'Bad Gateway'],
    [504, 'Gateway Timeout'],
  ])(
    'should not resend a POST on a %i, which may have been delivered',
    async (status, statusText) => {
      fetchMock.mockResolvedValue(
        buildResponse({ ok: false, status, statusText }),
      );

      await expect(requestTeamsConnector(POST_REQUEST)).rejects.toThrow(
        `${status} ${statusText}`,
      );

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(vi.getTimerCount()).toBe(0);
    },
  );

  it.each([502, 504])('should retry a GET on a %i', async (status) => {
    fetchMock
      .mockResolvedValueOnce(
        buildResponse({ ok: false, status, statusText: 'Gateway' }),
      )
      .mockResolvedValueOnce(buildResponse({ body: '{"id":"member-1"}' }));

    const request = requestTeamsConnector({
      serviceUrl: SERVICE_URL,
      path: '/v3/conversations/a/members/b',
      method: 'GET',
      accessToken: ACCESS_TOKEN,
    });

    await vi.advanceTimersByTimeAsync(1_000);

    await expect(request).resolves.toBe('{"id":"member-1"}');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('should not retry when the wait would outlast the request timeout', async () => {
    fetchMock.mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 9_500));

      return buildUnavailableResponse();
    });

    const failure = expect(requestTeamsConnector(POST_REQUEST)).rejects.toThrow(
      '503 Service Unavailable',
    );

    await vi.advanceTimersByTimeAsync(9_500);
    await failure;

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('should not resend once the caller aborts the retries', async () => {
    const retryAbortController = new AbortController();

    fetchMock.mockResolvedValue(buildUnavailableResponse());

    const failure = expect(
      requestTeamsConnector({
        ...POST_REQUEST,
        retryAbortSignal: retryAbortController.signal,
      }),
    ).rejects.toThrow('503 Service Unavailable');

    await vi.advanceTimersByTimeAsync(500);
    retryAbortController.abort();
    await vi.advanceTimersByTimeAsync(60_000);
    await failure;

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it.each([
    [400, 'Bad Request'],
    [401, 'Unauthorized'],
    [403, 'Forbidden'],
    [404, 'Not Found'],
  ])('should not retry a %i', async (status, statusText) => {
    fetchMock.mockResolvedValue(
      buildResponse({ ok: false, status, statusText }),
    );

    await expect(requestTeamsConnector(POST_REQUEST)).rejects.toThrow(
      `${status} ${statusText}`,
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('should not retry a POST that timed out', async () => {
    fetchMock.mockRejectedValue(
      new DOMException('The operation timed out', 'TimeoutError'),
    );

    await expect(requestTeamsConnector(POST_REQUEST)).rejects.toThrow(
      'The operation timed out',
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });
});
