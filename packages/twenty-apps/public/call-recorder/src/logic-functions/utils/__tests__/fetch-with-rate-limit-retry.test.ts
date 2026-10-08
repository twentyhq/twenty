import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RetryableLogicFunctionError } from 'twenty-sdk/logic-function';

import { fetchWithRateLimitRetry } from 'src/logic-functions/utils/fetch-with-rate-limit-retry.util';

const fetchMock = vi.fn<typeof fetch>();
const OPTIONS = {
  method: 'POST',
  body: JSON.stringify({ query: 'mutation { cancel }' }),
};
const rateLimitedResponse = (retryAfterMs: number) =>
  Response.json({
    errors: [{ extensions: { code: 'RATE_LIMITED', retryAfterMs } }],
  });

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(Math, 'random').mockReturnValue(0);
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('fetchWithRateLimitRetry', () => {
  it('waits for GraphQL retryAfterMs and retries only the throttled request', async () => {
    fetchMock
      .mockImplementationOnce(async () => rateLimitedResponse(15_000))
      .mockImplementationOnce(async () =>
        Response.json({ data: { cancel: { id: 'recording' } } }),
      );
    const result = fetchWithRateLimitRetry(
      'https://example.test/graphql',
      OPTIONS,
    );
    await vi.advanceTimersByTimeAsync(14_000);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1_000);
    expect(await (await result).json()).toEqual({
      data: { cancel: { id: 'recording' } },
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('honors HTTP Retry-After and adds jitter', async () => {
    vi.mocked(Math.random).mockReturnValue(0.5);
    fetchMock
      .mockImplementationOnce(
        async () =>
          new Response('rate limited', {
            status: 429,
            headers: { 'Retry-After': '5' },
          }),
      )
      .mockImplementationOnce(async () => Response.json({ data: {} }));
    const result = fetchWithRateLimitRetry(
      'https://example.test/graphql',
      OPTIONS,
    );
    await vi.advanceTimersByTimeAsync(5_000);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(500);
    await result;
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('hands persistent throttling back to the queue after the wait budget', async () => {
    fetchMock.mockImplementation(async () => rateLimitedResponse(60_000));
    const result = fetchWithRateLimitRetry(
      'https://example.test/graphql',
      OPTIONS,
    );
    const assertion = expect(result).rejects.toBeInstanceOf(
      RetryableLogicFunctionError,
    );
    await vi.advanceTimersByTimeAsync(120_000);
    await assertion;
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('does not replay a partially successful mutation', async () => {
    const body = {
      data: { firstMutation: { id: 'recording' }, secondMutation: null },
      errors: [{ extensions: { code: 'RATE_LIMITED', retryAfterMs: 1_000 } }],
    };
    fetchMock.mockImplementation(async () => Response.json(body));
    const response = await fetchWithRateLimitRetry(
      'https://example.test/graphql',
      OPTIONS,
    );
    expect(await response.json()).toEqual(body);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('does not retry unrelated GraphQL errors or uncertain mutation failures', async () => {
    fetchMock
      .mockImplementationOnce(async () =>
        Response.json({
          errors: [{ extensions: { code: 'FORBIDDEN' } }],
        }),
      )
      .mockImplementationOnce(
        async () => new Response('unavailable', { status: 503 }),
      );
    await fetchWithRateLimitRetry('https://example.test/graphql', OPTIONS);
    expect(
      (await fetchWithRateLimitRetry('https://example.test/graphql', OPTIONS))
        .status,
    ).toBe(503);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
