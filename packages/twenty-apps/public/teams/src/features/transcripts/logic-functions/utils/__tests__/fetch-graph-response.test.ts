import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchGraphResponse } from 'src/features/transcripts/logic-functions/utils/fetch-graph-response';

const REQUEST = {
  accessToken: 'graph-access-token',
  url: '/me/onlineMeetings',
  accept: 'application/json',
};

const fetchMock = vi.fn();

const buildFailedResponse = ({
  status,
  retryAfter,
}: {
  status: number;
  retryAfter?: string;
}) =>
  new Response(JSON.stringify({ error: { message: 'Try later' } }), {
    status,
    headers: retryAfter === undefined ? {} : { 'Retry-After': retryAfter },
  });

describe('fetchGraphResponse', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: new Date('2026-01-01T00:00:00Z') });
    fetchMock.mockReset();
    fetchMock.mockImplementation(async () => new Response('{}'));
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(Math, 'random').mockReturnValue(1);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it.each([429, 502, 503, 504])(
    'should retry a %i with a doubling delay and no jitter, then give up after four attempts',
    async (status) => {
      fetchMock.mockImplementation(async () => buildFailedResponse({ status }));

      const failure = expect(fetchGraphResponse(REQUEST)).rejects.toThrow(
        `Microsoft Graph request failed (${status}): Try later`,
      );

      await vi.advanceTimersByTimeAsync(999);
      expect(fetchMock).toHaveBeenCalledTimes(1);

      await vi.advanceTimersByTimeAsync(1);
      expect(fetchMock).toHaveBeenCalledTimes(2);

      await vi.advanceTimersByTimeAsync(2_000);
      expect(fetchMock).toHaveBeenCalledTimes(3);

      await vi.advanceTimersByTimeAsync(3_999);
      expect(fetchMock).toHaveBeenCalledTimes(3);

      await vi.advanceTimersByTimeAsync(1);
      await failure;

      expect(fetchMock).toHaveBeenCalledTimes(4);
    },
  );

  it('should wait for the Retry-After seconds, even a long one', async () => {
    fetchMock.mockImplementationOnce(async () =>
      buildFailedResponse({ status: 429, retryAfter: '30' }),
    );

    const request = fetchGraphResponse(REQUEST);

    await vi.advanceTimersByTimeAsync(29_999);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);

    await expect(request).resolves.toHaveProperty('ok', true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('should honour a sub-second Retry-After', async () => {
    fetchMock.mockImplementationOnce(async () =>
      buildFailedResponse({ status: 429, retryAfter: '0.5' }),
    );

    const request = fetchGraphResponse(REQUEST);

    await vi.advanceTimersByTimeAsync(500);
    await request;

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it.each(['0', 'Thu, 01 Jan 2026 00:00:30 GMT'])(
    'should fall back to the backoff when Retry-After is %j',
    async (retryAfter) => {
      fetchMock.mockImplementationOnce(async () =>
        buildFailedResponse({ status: 429, retryAfter }),
      );

      const request = fetchGraphResponse(REQUEST);

      await vi.advanceTimersByTimeAsync(999);
      expect(fetchMock).toHaveBeenCalledTimes(1);

      await vi.advanceTimersByTimeAsync(1);
      await request;

      expect(fetchMock).toHaveBeenCalledTimes(2);
    },
  );

  it('should not retry a status outside the retryable set', async () => {
    fetchMock.mockImplementation(async () =>
      buildFailedResponse({ status: 404 }),
    );

    await expect(fetchGraphResponse(REQUEST)).rejects.toThrow(
      'Microsoft Graph request failed (404): Try later',
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('should not retry a fetch that throws', async () => {
    fetchMock.mockRejectedValue(new TypeError('fetch failed'));

    await expect(fetchGraphResponse(REQUEST)).rejects.toThrow('fetch failed');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
