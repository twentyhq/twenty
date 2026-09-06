import { afterEach, describe, expect, it, vi } from 'vitest';

import { runWithTimeout } from 'src/logic-functions/utils/run-with-timeout';

describe('runWithTimeout', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return the operation value when it settles in time', async () => {
    const result = await runWithTimeout({
      operation: Promise.resolve('context'),
      timeoutMs: 1000,
      buildTimeoutValue: () => 'fallback',
    });

    expect(result).toBe('context');
  });

  it('should return the timeout value when the operation is too slow', async () => {
    vi.useFakeTimers();

    const pendingOperation = new Promise<string>(() => undefined);

    const resultPromise = runWithTimeout({
      operation: pendingOperation,
      timeoutMs: 1000,
      buildTimeoutValue: () => 'fallback',
    });

    await vi.advanceTimersByTimeAsync(1000);

    expect(await resultPromise).toBe('fallback');
  });

  it('should not build the timeout value when the operation wins', async () => {
    const buildTimeoutValue = vi.fn(() => 'fallback');

    await runWithTimeout({
      operation: Promise.resolve('context'),
      timeoutMs: 1000,
      buildTimeoutValue,
    });

    expect(buildTimeoutValue).not.toHaveBeenCalled();
  });

  it('should propagate a rejected operation', async () => {
    await expect(
      runWithTimeout({
        operation: Promise.reject(new Error('read failed')),
        timeoutMs: 1000,
        buildTimeoutValue: () => 'fallback',
      }),
    ).rejects.toThrow('read failed');
  });
});
