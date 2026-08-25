import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createCoreApiRetryingFetch } from 'src/logic-functions/data/core-api-retrying-fetch.util';

const jsonResponse = (status: number, headers: HeadersInit = {}) =>
  new Response('{}', { status, headers });

describe('createCoreApiRetryingFetch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('returns a successful response without retrying', async () => {
    const baseFetchMock = vi.fn().mockResolvedValue(jsonResponse(200));
    const retryingFetch = createCoreApiRetryingFetch(baseFetchMock);

    const response = await retryingFetch('https://api.test/graphql');

    expect(response.status).toBe(200);
    expect(baseFetchMock).toHaveBeenCalledTimes(1);
  });

  it('returns non-retryable failures without retrying', async () => {
    const baseFetchMock = vi.fn().mockResolvedValue(jsonResponse(400));
    const retryingFetch = createCoreApiRetryingFetch(baseFetchMock);

    const response = await retryingFetch('https://api.test/graphql');

    expect(response.status).toBe(400);
    expect(baseFetchMock).toHaveBeenCalledTimes(1);
  });

  it('retries rate limiting with the retry-after delay', async () => {
    const baseFetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(429, { 'retry-after': '5' }))
      .mockResolvedValueOnce(jsonResponse(200));
    const retryingFetch = createCoreApiRetryingFetch(baseFetchMock);

    const responsePromise = retryingFetch('https://api.test/graphql');

    await vi.advanceTimersByTimeAsync(5_000);

    expect((await responsePromise).status).toBe(200);
    expect(baseFetchMock).toHaveBeenCalledTimes(2);
  });

  it('retries transient gateway failures and network errors with backoff', async () => {
    const baseFetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(503))
      .mockRejectedValueOnce(new Error('fetch failed'))
      .mockResolvedValueOnce(jsonResponse(200));
    const retryingFetch = createCoreApiRetryingFetch(baseFetchMock);

    const responsePromise = retryingFetch('https://api.test/graphql');

    await vi.advanceTimersByTimeAsync(2_000);
    await vi.advanceTimersByTimeAsync(4_000);

    expect((await responsePromise).status).toBe(200);
    expect(baseFetchMock).toHaveBeenCalledTimes(3);
  });

  it('returns the final rate-limited response once attempts are exhausted', async () => {
    const baseFetchMock = vi.fn().mockResolvedValue(jsonResponse(429));
    const retryingFetch = createCoreApiRetryingFetch(baseFetchMock);

    const responsePromise = retryingFetch('https://api.test/graphql');

    await vi.advanceTimersByTimeAsync(2_000 + 4_000 + 8_000 + 16_000);

    expect((await responsePromise).status).toBe(429);
    expect(baseFetchMock).toHaveBeenCalledTimes(5);
  });

  it('does not retry an aborted request', async () => {
    const abortError = Object.assign(new Error('aborted'), {
      name: 'AbortError',
    });
    const baseFetchMock = vi.fn().mockRejectedValue(abortError);
    const retryingFetch = createCoreApiRetryingFetch(baseFetchMock);

    await expect(retryingFetch('https://api.test/graphql')).rejects.toBe(
      abortError,
    );
    expect(baseFetchMock).toHaveBeenCalledTimes(1);
  });
});
