import { isDefined } from 'twenty-sdk/utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchGraphResponse } from 'src/features/transcripts/logic-functions/utils/fetch-graph-response';

const fetchMock = vi.fn();

const buildResponse = ({
  status,
  retryAfter,
  body,
}: {
  status: number;
  retryAfter?: string;
  body?: object;
}) =>
  new Response(isDefined(body) ? JSON.stringify(body) : null, {
    status,
    headers: isDefined(retryAfter) ? { 'Retry-After': retryAfter } : {},
  });

const fetchMe = () =>
  fetchGraphResponse({
    accessToken: 'graph-token',
    url: 'me',
    accept: 'application/json',
  });

describe('fetchGraphResponse', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('should retry a throttled request with a doubling delay', async () => {
    fetchMock
      .mockResolvedValueOnce(buildResponse({ status: 429 }))
      .mockResolvedValueOnce(buildResponse({ status: 503 }))
      .mockResolvedValueOnce(buildResponse({ status: 200 }));

    const request = fetchMe();

    await vi.advanceTimersByTimeAsync(1_000);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(1_999);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(1);

    await expect(request).resolves.toHaveProperty('status', 200);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('should wait for Retry-After, even when it is long', async () => {
    fetchMock
      .mockResolvedValueOnce(buildResponse({ status: 429, retryAfter: '30' }))
      .mockResolvedValueOnce(buildResponse({ status: 200 }));

    const request = fetchMe();

    await vi.advanceTimersByTimeAsync(29_999);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);

    await expect(request).resolves.toHaveProperty('status', 200);
  });

  it('should fall back to the backoff delay when Retry-After is zero', async () => {
    fetchMock
      .mockResolvedValueOnce(buildResponse({ status: 503, retryAfter: '0' }))
      .mockResolvedValueOnce(buildResponse({ status: 200 }));

    const request = fetchMe();

    await vi.advanceTimersByTimeAsync(999);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);
    await request;

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('should throw the Graph error after four attempts', async () => {
    fetchMock.mockImplementation(async () =>
      buildResponse({
        status: 503,
        body: {
          error: { message: 'Try later', innerError: { code: 'Busy' } },
        },
      }),
    );

    const failure = expect(fetchMe()).rejects.toMatchObject({
      message: 'Microsoft Graph request failed (503 Busy): Try later',
      status: 503,
      innerErrorCode: 'Busy',
    });

    await vi.advanceTimersByTimeAsync(60_000);
    await failure;

    expect(fetchMock).toHaveBeenCalledTimes(4);
  });
});
