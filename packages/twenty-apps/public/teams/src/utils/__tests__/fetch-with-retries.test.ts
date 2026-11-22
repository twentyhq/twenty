import { isDefined } from 'twenty-sdk/utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchWithRetries } from 'src/utils/fetch-with-retries';

const buildResponse = ({
  status,
  retryAfter,
}: {
  status: number;
  retryAfter?: string;
}) =>
  new Response(null, {
    status,
    headers: isDefined(retryAfter) ? { 'retry-after': retryAfter } : {},
  });

const sendRequestMock = vi.fn();
const getRetryDelayMsMock = vi.fn();

const fetchWithTestRetries = (retryAbortSignal?: AbortSignal) =>
  fetchWithRetries({
    sendRequest: sendRequestMock,
    maxAttempts: 3,
    isRetryableStatus: (status) => status === 503,
    getRetryDelayMs: getRetryDelayMsMock,
    retryAbortSignal,
  });

describe('fetchWithRetries', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sendRequestMock.mockReset();
    getRetryDelayMsMock.mockReset();
    getRetryDelayMsMock.mockReturnValue(1_000);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should retry a retryable status after the delay the caller chose', async () => {
    sendRequestMock
      .mockResolvedValueOnce(buildResponse({ status: 503, retryAfter: '7' }))
      .mockResolvedValueOnce(buildResponse({ status: 200 }));

    const request = fetchWithTestRetries();

    await vi.advanceTimersByTimeAsync(999);
    expect(sendRequestMock).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);

    await expect(request).resolves.toHaveProperty('status', 200);
    expect(getRetryDelayMsMock).toHaveBeenCalledExactlyOnceWith({
      attempt: 0,
      retryAfterMs: 7_000,
      waitedMs: 0,
    });
  });

  it('should report the time already waited on later attempts', async () => {
    sendRequestMock.mockResolvedValue(buildResponse({ status: 503 }));

    const request = fetchWithTestRetries();

    await vi.advanceTimersByTimeAsync(2_000);
    await request;

    expect(getRetryDelayMsMock).toHaveBeenLastCalledWith({
      attempt: 1,
      retryAfterMs: undefined,
      waitedMs: 1_000,
    });
  });

  it('should hand back the failed response once attempts run out', async () => {
    sendRequestMock.mockResolvedValue(buildResponse({ status: 503 }));

    const request = fetchWithTestRetries();

    await vi.advanceTimersByTimeAsync(60_000);

    await expect(request).resolves.toHaveProperty('status', 503);
    expect(sendRequestMock).toHaveBeenCalledTimes(3);
  });

  it('should not retry a status the caller does not list', async () => {
    sendRequestMock.mockResolvedValue(buildResponse({ status: 404 }));

    await expect(fetchWithTestRetries()).resolves.toHaveProperty('status', 404);

    expect(sendRequestMock).toHaveBeenCalledTimes(1);
  });

  it('should give up when the caller returns no delay', async () => {
    getRetryDelayMsMock.mockReturnValue(undefined);
    sendRequestMock.mockResolvedValue(buildResponse({ status: 503 }));

    await expect(fetchWithTestRetries()).resolves.toHaveProperty('status', 503);

    expect(sendRequestMock).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('should not resend once the retries are aborted', async () => {
    const retryAbortController = new AbortController();

    sendRequestMock.mockResolvedValue(buildResponse({ status: 503 }));

    const request = fetchWithTestRetries(retryAbortController.signal);

    await vi.advanceTimersByTimeAsync(500);
    retryAbortController.abort();
    await vi.advanceTimersByTimeAsync(60_000);

    await expect(request).resolves.toHaveProperty('status', 503);
    expect(sendRequestMock).toHaveBeenCalledTimes(1);
  });

  it('should cancel the body of a response it discards', async () => {
    const discardedResponse = new Response('busy', { status: 503 });

    sendRequestMock
      .mockResolvedValueOnce(discardedResponse)
      .mockResolvedValueOnce(buildResponse({ status: 200 }));

    const request = fetchWithTestRetries();

    await vi.advanceTimersByTimeAsync(1_000);
    await request;

    await expect(discardedResponse.text()).rejects.toThrow();
  });

  it('should not retry a request that throws', async () => {
    sendRequestMock.mockRejectedValue(new Error('network down'));

    await expect(fetchWithTestRetries()).rejects.toThrow('network down');

    expect(sendRequestMock).toHaveBeenCalledTimes(1);
  });
});
