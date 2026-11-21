import { isDefined } from 'twenty-sdk/utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { requestWithRetries } from 'src/utils/request-with-retries';

type TestResponse = Pick<Response, 'ok' | 'status' | 'headers'>;

const buildResponse = ({
  status = 200,
  retryAfter,
}: {
  status?: number;
  retryAfter?: string;
} = {}): TestResponse => ({
  ok: status < 400,
  status,
  headers: new Headers(
    isDefined(retryAfter) ? { 'retry-after': retryAfter } : {},
  ),
});

const sendRequest =
  vi.fn<(timeoutSignal: AbortSignal | undefined) => Promise<TestResponse>>();

const OPTIONS = {
  sendRequest,
  isRetryableStatus: (status: number) => status === 503,
  maxAttempts: 3,
  baseDelayMs: 1_000,
};

describe('requestWithRetries', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: new Date('2026-01-01T00:00:00Z') });
    sendRequest.mockReset();
    sendRequest.mockResolvedValue(buildResponse());
    vi.spyOn(Math, 'random').mockReturnValue(1);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should return a successful response without waiting', async () => {
    const response = buildResponse();

    sendRequest.mockResolvedValue(response);

    await expect(requestWithRetries(OPTIONS)).resolves.toBe(response);
    expect(sendRequest).toHaveBeenCalledTimes(1);
    expect(sendRequest).toHaveBeenCalledWith(undefined);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('should return a failed response whose status is not retryable', async () => {
    const response = buildResponse({ status: 404 });

    sendRequest.mockResolvedValue(response);

    await expect(requestWithRetries(OPTIONS)).resolves.toBe(response);
    expect(sendRequest).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('should retry with a doubling delay and no jitter by default', async () => {
    const response = buildResponse();

    sendRequest
      .mockResolvedValueOnce(buildResponse({ status: 503 }))
      .mockResolvedValueOnce(buildResponse({ status: 503 }))
      .mockResolvedValueOnce(response);

    const request = requestWithRetries(OPTIONS);

    await vi.advanceTimersByTimeAsync(999);
    expect(sendRequest).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);
    expect(sendRequest).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(1_999);
    expect(sendRequest).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(1);

    await expect(request).resolves.toBe(response);
  });

  it('should return the last failed response once attempts run out', async () => {
    const lastResponse = buildResponse({ status: 503 });

    sendRequest
      .mockResolvedValueOnce(buildResponse({ status: 503 }))
      .mockResolvedValueOnce(buildResponse({ status: 503 }))
      .mockResolvedValueOnce(lastResponse);

    const request = requestWithRetries(OPTIONS);

    await vi.advanceTimersByTimeAsync(3_000);

    await expect(request).resolves.toBe(lastResponse);
    expect(sendRequest).toHaveBeenCalledTimes(3);
  });

  it('should not retry a request that throws', async () => {
    sendRequest.mockRejectedValue(new Error('socket hang up'));

    await expect(requestWithRetries(OPTIONS)).rejects.toThrow('socket hang up');
    expect(sendRequest).toHaveBeenCalledTimes(1);
  });

  it('should wait for the Retry-After seconds, however long, when there is no wait budget', async () => {
    sendRequest.mockResolvedValueOnce(
      buildResponse({ status: 503, retryAfter: '120' }),
    );

    const request = requestWithRetries(OPTIONS);

    await vi.advanceTimersByTimeAsync(119_999);
    expect(sendRequest).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);
    await request;

    expect(sendRequest).toHaveBeenCalledTimes(2);
  });

  it('should ignore a Retry-After date unless dates are accepted', async () => {
    sendRequest.mockResolvedValueOnce(
      buildResponse({
        status: 503,
        retryAfter: 'Thu, 01 Jan 2026 00:00:03 GMT',
      }),
    );

    const request = requestWithRetries(OPTIONS);

    await vi.advanceTimersByTimeAsync(1_000);
    await request;

    expect(sendRequest).toHaveBeenCalledTimes(2);
  });

  it('should wait until the Retry-After date when dates are accepted', async () => {
    sendRequest.mockResolvedValueOnce(
      buildResponse({
        status: 503,
        retryAfter: 'Thu, 01 Jan 2026 00:00:03 GMT',
      }),
    );

    const request = requestWithRetries({
      ...OPTIONS,
      shouldParseRetryAfterHttpDate: true,
    });

    await vi.advanceTimersByTimeAsync(2_999);
    expect(sendRequest).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);
    await request;

    expect(sendRequest).toHaveBeenCalledTimes(2);
  });

  it('should add jitter to the backoff when a ratio is given', async () => {
    sendRequest.mockResolvedValueOnce(buildResponse({ status: 503 }));

    const request = requestWithRetries({ ...OPTIONS, jitterRatio: 0.25 });

    await vi.advanceTimersByTimeAsync(1_249);
    expect(sendRequest).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);
    await request;

    expect(sendRequest).toHaveBeenCalledTimes(2);
  });

  it('should raise a short Retry-After to the floor', async () => {
    sendRequest.mockResolvedValueOnce(
      buildResponse({ status: 503, retryAfter: '0' }),
    );

    const request = requestWithRetries({
      ...OPTIONS,
      baseDelayMs: 200,
      minRetryAfterDelayMs: 1_000,
    });

    await vi.advanceTimersByTimeAsync(999);
    expect(sendRequest).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);
    await request;

    expect(sendRequest).toHaveBeenCalledTimes(2);
  });

  it('should give up when Retry-After exceeds the total wait budget', async () => {
    const response = buildResponse({ status: 503, retryAfter: '5' });

    sendRequest.mockResolvedValue(response);

    await expect(
      requestWithRetries({ ...OPTIONS, maxTotalWaitMs: 4_000 }),
    ).resolves.toBe(response);
    expect(sendRequest).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('should cap the summed waits at the total wait budget', async () => {
    sendRequest
      .mockResolvedValueOnce(buildResponse({ status: 503, retryAfter: '3' }))
      .mockResolvedValueOnce(buildResponse({ status: 503 }));

    const request = requestWithRetries({ ...OPTIONS, maxTotalWaitMs: 4_000 });

    await vi.advanceTimersByTimeAsync(3_000);
    expect(sendRequest).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(999);
    expect(sendRequest).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(1);
    await request;

    expect(sendRequest).toHaveBeenCalledTimes(3);
  });

  it('should give up once the total wait budget is spent', async () => {
    const lastResponse = buildResponse({ status: 503 });

    sendRequest
      .mockResolvedValueOnce(buildResponse({ status: 503, retryAfter: '4' }))
      .mockResolvedValueOnce(lastResponse);

    const request = requestWithRetries({ ...OPTIONS, maxTotalWaitMs: 4_000 });

    await vi.advanceTimersByTimeAsync(4_000);

    await expect(request).resolves.toBe(lastResponse);
    expect(sendRequest).toHaveBeenCalledTimes(2);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('should hand each attempt a signal bound to the shared timeout', async () => {
    sendRequest.mockResolvedValueOnce(buildResponse({ status: 503 }));

    const request = requestWithRetries({ ...OPTIONS, timeoutMs: 10_000 });

    await vi.advanceTimersByTimeAsync(1_000);
    await request;

    expect(sendRequest).toHaveBeenNthCalledWith(1, expect.any(AbortSignal));
    expect(sendRequest).toHaveBeenNthCalledWith(2, expect.any(AbortSignal));
  });

  it('should give up when the wait would outlast the timeout', async () => {
    const response = buildResponse({ status: 503 });

    sendRequest.mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 9_500));

      return response;
    });

    const request = requestWithRetries({ ...OPTIONS, timeoutMs: 10_000 });

    await vi.advanceTimersByTimeAsync(9_500);

    await expect(request).resolves.toBe(response);
    expect(sendRequest).toHaveBeenCalledTimes(1);
  });

  it('should not resend once the retry abort signal is aborted during the wait', async () => {
    const retryAbortController = new AbortController();
    const response = buildResponse({ status: 503 });

    sendRequest.mockResolvedValue(response);

    const request = requestWithRetries({
      ...OPTIONS,
      retryAbortSignal: retryAbortController.signal,
    });

    await vi.advanceTimersByTimeAsync(500);
    retryAbortController.abort();
    await vi.advanceTimersByTimeAsync(60_000);

    await expect(request).resolves.toBe(response);
    expect(sendRequest).toHaveBeenCalledTimes(1);
  });
});
