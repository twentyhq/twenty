import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { executeWithRetry } from 'src/utils/execute-with-retry';

// The client SDK surfaces a GraphQL error as an Error carrying the raw errors
// array, and the API answers a rate limit with HTTP 200, so the extensions are
// the only place the refusal is visible.
const buildGraphqlError = (
  message: string,
  extensions: Record<string, unknown>,
) => Object.assign(new Error(message), { errors: [{ message, extensions }] });

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

  it('retries the application throttler, which reports itself as a user input error', async () => {
    const execute = vi
      .fn()
      .mockRejectedValueOnce(
        buildGraphqlError('Limit reached (500 tokens per 60000 ms)', {
          code: 'BAD_USER_INPUT',
          subCode: 'LIMIT_REACHED',
        }),
      )
      .mockResolvedValue('ok');

    const promise = executeWithRetry(execute);
    await vi.advanceTimersByTimeAsync(2_000);

    await expect(promise).resolves.toBe('ok');
    expect(execute).toHaveBeenCalledTimes(2);
  });

  it('retries a rate-limited usage limit', async () => {
    const execute = vi
      .fn()
      .mockRejectedValueOnce(
        buildGraphqlError(
          'Rate limit exceeded for application: 500 requests per 60s.',
          { code: 'RATE_LIMITED' },
        ),
      )
      .mockResolvedValue('ok');

    const promise = executeWithRetry(execute);
    await vi.advanceTimersByTimeAsync(2_000);

    await expect(promise).resolves.toBe('ok');
    expect(execute).toHaveBeenCalledTimes(2);
  });

  it('waits for the retryAfterMs the server reports when it exceeds the backoff', async () => {
    const execute = vi
      .fn()
      .mockRejectedValueOnce(
        buildGraphqlError('Rate limit exceeded', {
          code: 'RATE_LIMITED',
          retryAfterMs: 11_000,
        }),
      )
      .mockResolvedValue('ok');

    const promise = executeWithRetry(execute);
    await vi.advanceTimersByTimeAsync(10_000);
    expect(execute).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1_000);
    await expect(promise).resolves.toBe('ok');
    expect(execute).toHaveBeenCalledTimes(2);
  });

  it('does not retry a genuine user input error', async () => {
    const execute = vi
      .fn()
      .mockRejectedValue(
        buildGraphqlError('Field "nope" is not defined', {
          code: 'BAD_USER_INPUT',
        }),
      );

    await expect(executeWithRetry(execute)).rejects.toThrow('not defined');
    expect(execute).toHaveBeenCalledTimes(1);
  });

  it('does not retry non-retryable errors', async () => {
    const execute = vi
      .fn()
      .mockRejectedValue(new Error('Bad Request: invalid data'));

    await expect(executeWithRetry(execute)).rejects.toThrow('Bad Request');
    expect(execute).toHaveBeenCalledTimes(1);
  });

  it('gives up after exhausting retries', async () => {
    const execute = vi
      .fn()
      .mockRejectedValue(new Error('Gateway time-out: origin overloaded'));

    const promise = executeWithRetry(execute);
    const assertion = expect(promise).rejects.toThrow('Gateway time-out');
    await vi.advanceTimersByTimeAsync(60_000);

    await assertion;
    expect(execute).toHaveBeenCalledTimes(5);
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
