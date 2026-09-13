import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { executeWithRetry } from 'src/logic-functions/data/execute-with-retry.util';

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(Math, 'random').mockReturnValue(0);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('executeWithRetry', () => {
  it('should return the result on first success', async () => {
    const execute = vi.fn().mockResolvedValue('ok');

    await expect(executeWithRetry(execute)).resolves.toBe('ok');
    expect(execute).toHaveBeenCalledTimes(1);
  });

  it('should retry rate-limited requests until they succeed', async () => {
    const execute = vi
      .fn()
      .mockRejectedValueOnce(new Error('Too Many Requests: {"message":"slow"}'))
      .mockResolvedValue('ok');

    const promise = executeWithRetry(execute);
    await vi.advanceTimersByTimeAsync(2_000);

    await expect(promise).resolves.toBe('ok');
    expect(execute).toHaveBeenCalledTimes(2);
  });

  it('should not retry an authentication failure', async () => {
    const execute = vi
      .fn()
      .mockRejectedValue(new Error('Google People API returned 401'));

    await expect(executeWithRetry(execute)).rejects.toThrow('returned 401');
    expect(execute).toHaveBeenCalledTimes(1);
  });

  it('should retry a rate limit reported only in the response body', async () => {
    const execute = vi
      .fn()
      .mockRejectedValueOnce(new Error(': {"statusCode":429,"message":"slow"}'))
      .mockResolvedValue('ok');

    const promise = executeWithRetry(execute);
    await vi.advanceTimersByTimeAsync(2_000);

    await expect(promise).resolves.toBe('ok');
    expect(execute).toHaveBeenCalledTimes(2);
  });

  it('should not retry a client error whose body merely contains a status-like number', async () => {
    const execute = vi
      .fn()
      .mockRejectedValue(
        new Error(
          'Bad Request: {"errors":[{"message":"Phone +1 502 555 0199 is invalid"}]}',
        ),
      );

    await expect(executeWithRetry(execute)).rejects.toThrow('Bad Request');
    expect(execute).toHaveBeenCalledTimes(1);
  });

  it('should retry a network failure that never produced a response', async () => {
    const execute = vi
      .fn()
      .mockRejectedValueOnce(new Error('fetch failed'))
      .mockResolvedValue('ok');

    const promise = executeWithRetry(execute);
    await vi.advanceTimersByTimeAsync(2_000);

    await expect(promise).resolves.toBe('ok');
    expect(execute).toHaveBeenCalledTimes(2);
  });

  it('should give up after exhausting retries', async () => {
    const execute = vi
      .fn()
      .mockRejectedValue(new Error('Service Unavailable: {"message":"down"}'));

    const promise = executeWithRetry(execute);
    const assertion = expect(promise).rejects.toThrow('Service Unavailable');
    await vi.advanceTimersByTimeAsync(60_000);

    await assertion;
    expect(execute).toHaveBeenCalledTimes(5);
  });
});
