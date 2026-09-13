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
      .mockRejectedValueOnce(new Error('Request failed with status code 429'))
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

  it('should give up after exhausting retries', async () => {
    const execute = vi
      .fn()
      .mockRejectedValue(new Error('Request failed with status code 503'));

    const promise = executeWithRetry(execute);
    const assertion = expect(promise).rejects.toThrow('status code 503');
    await vi.advanceTimersByTimeAsync(60_000);

    await assertion;
    expect(execute).toHaveBeenCalledTimes(5);
  });
});
