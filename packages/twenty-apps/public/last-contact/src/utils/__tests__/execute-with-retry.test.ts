import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RetryableLogicFunctionError } from 'twenty-sdk/logic-function';

import { executeWithRetry } from 'src/utils/execute-with-retry';

const buildRateLimitedError = (retryAfterMs: number) =>
  Object.assign(
    new Error('Rate limit exceeded for application: 500 requests per 60s.'),
    {
      errors: [{ extensions: { code: 'RATE_LIMITED', retryAfterMs } }],
    },
  );

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(Math, 'random').mockReturnValue(0);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('executeWithRetry', () => {
  it('returns the result on first success', async () => {
    const execute = vi.fn().mockResolvedValue('ok');

    await expect(executeWithRetry(execute)).resolves.toBe('ok');
    expect(execute).toHaveBeenCalledTimes(1);
  });

  it('retries rate-limited requests until they succeed', async () => {
    const execute = vi
      .fn()
      .mockRejectedValueOnce(new Error('Too Many Requests: error code 1015'))
      .mockResolvedValue('ok');

    const promise = executeWithRetry(execute);
    await vi.advanceTimersByTimeAsync(2_000);

    await expect(promise).resolves.toBe('ok');
    expect(execute).toHaveBeenCalledTimes(2);
  });

  it('does not retry non-retryable errors', async () => {
    const execute = vi
      .fn()
      .mockRejectedValue(new Error('Bad Request: invalid data'));

    await expect(executeWithRetry(execute)).rejects.toThrow('Bad Request');
    expect(execute).toHaveBeenCalledTimes(1);
  });

  it('hands the job back to the queue once the wait budget is spent', async () => {
    const execute = vi
      .fn()
      .mockRejectedValue(new Error('Gateway time-out: origin overloaded'));

    const promise = executeWithRetry(execute);
    const assertion = expect(promise).rejects.toThrow(
      RetryableLogicFunctionError,
    );
    await vi.advanceTimersByTimeAsync(120_000);

    await assertion;
    await expect(promise).rejects.toThrow('Gateway time-out');
    // Waits of 2, 4, 8, 16, 30, 30 and 30 seconds use the 120 second budget.
    expect(execute).toHaveBeenCalledTimes(8);
  });

  it('waits for the retryAfterMs of a rate-limited GraphQL error', async () => {
    const execute = vi
      .fn()
      .mockRejectedValueOnce(buildRateLimitedError(15_000))
      .mockResolvedValue('ok');

    const promise = executeWithRetry(execute);
    await vi.advanceTimersByTimeAsync(14_000);
    expect(execute).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1_000);
    await expect(promise).resolves.toBe('ok');
    expect(execute).toHaveBeenCalledTimes(2);
  });

  it('waits for the server-provided retry_after when it exceeds the backoff', async () => {
    const execute = vi
      .fn()
      .mockRejectedValueOnce(
        new Error('Gateway time-out: {"retryable": true, "retry_after": 10}'),
      )
      .mockResolvedValue('ok');

    const promise = executeWithRetry(execute);
    await vi.advanceTimersByTimeAsync(9_000);
    expect(execute).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1_000);
    await expect(promise).resolves.toBe('ok');
    expect(execute).toHaveBeenCalledTimes(2);
  });
});
