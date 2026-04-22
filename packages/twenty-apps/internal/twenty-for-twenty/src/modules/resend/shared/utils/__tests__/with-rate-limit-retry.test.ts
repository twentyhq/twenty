import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { withRateLimitRetry } from '@modules/resend/shared/utils/with-rate-limit-retry';

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('withRateLimitRetry', () => {
  it('returns the resolved value when no error is present', async () => {
    const result = await withRateLimitRetry(async () => ({
      data: { ok: true },
      error: null,
    }));

    expect(result).toEqual({ data: { ok: true }, error: null });
  });

  it('retries on a Resend-shape rate-limit error response and eventually returns success', async () => {
    const fn = vi
      .fn()
      .mockResolvedValueOnce({
        data: null,
        error: { message: 'Too Many Requests', name: 'rate_limit_exceeded' },
      })
      .mockResolvedValueOnce({ data: { ok: true }, error: null });

    const result = await withRateLimitRetry(fn, {
      channel: 'test-error-response',
    });

    expect(fn).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ data: { ok: true }, error: null });
  }, 15_000);

  it('retries on a thrown rate-limit error', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('rate limit hit'))
      .mockResolvedValueOnce({ data: 'ok', error: null });

    const result = await withRateLimitRetry(fn, { channel: 'test-thrown' });

    expect(fn).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ data: 'ok', error: null });
  }, 15_000);

  it('rethrows non-rate-limit errors immediately', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('schema mismatch'));

    await expect(
      withRateLimitRetry(fn, { channel: 'test-rethrow' }),
    ).rejects.toThrow('schema mismatch');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('uses independent throttle timestamps per channel', async () => {
    let counterA = 0;
    let counterB = 0;

    const fnA = vi.fn(async () => ({ data: ++counterA, error: null }));
    const fnB = vi.fn(async () => ({ data: ++counterB, error: null }));

    await Promise.all([
      withRateLimitRetry(fnA, { channel: 'channel-a' }),
      withRateLimitRetry(fnB, { channel: 'channel-b' }),
    ]);

    expect(fnA).toHaveBeenCalledTimes(1);
    expect(fnB).toHaveBeenCalledTimes(1);
  });
});
