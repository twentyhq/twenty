import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getRetryDelayMs } from 'src/utils/get-retry-delay-ms';

const DEFAULTS: Parameters<typeof getRetryDelayMs>[0] = {
  attempt: 0,
  retryAfterMs: undefined,
  baseDelayMs: 1_000,
  jitterRatio: 0,
  minRetryAfterDelayMs: 0,
  maxDelayMs: Number.POSITIVE_INFINITY,
};

describe('getRetryDelayMs', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(1);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    [0, 1_000],
    [1, 2_000],
    [2, 4_000],
  ])('should double the backoff on attempt %i', (attempt, expectedMs) => {
    expect(getRetryDelayMs({ ...DEFAULTS, attempt })).toBe(expectedMs);
  });

  it('should add jitter on top of the backoff', () => {
    expect(
      getRetryDelayMs({ ...DEFAULTS, attempt: 1, jitterRatio: 0.25 }),
    ).toBe(2_500);
  });

  it('should cap the backoff at the max delay', () => {
    expect(
      getRetryDelayMs({ ...DEFAULTS, attempt: 2, maxDelayMs: 1_500 }),
    ).toBe(1_500);
  });

  it('should use Retry-After instead of the backoff, without jitter', () => {
    expect(
      getRetryDelayMs({
        ...DEFAULTS,
        attempt: 2,
        retryAfterMs: 500,
        jitterRatio: 0.25,
      }),
    ).toBe(500);
  });

  it('should raise a short Retry-After to the floor', () => {
    expect(
      getRetryDelayMs({
        ...DEFAULTS,
        retryAfterMs: 0,
        minRetryAfterDelayMs: 1_000,
      }),
    ).toBe(1_000);
  });

  it('should fall back to the backoff on a zero Retry-After without a floor', () => {
    expect(getRetryDelayMs({ ...DEFAULTS, attempt: 1, retryAfterMs: 0 })).toBe(
      2_000,
    );
  });

  it('should return zero when Retry-After exceeds the max delay', () => {
    expect(
      getRetryDelayMs({ ...DEFAULTS, retryAfterMs: 5_000, maxDelayMs: 4_000 }),
    ).toBe(0);
  });

  it('should return zero when no delay budget is left', () => {
    expect(getRetryDelayMs({ ...DEFAULTS, maxDelayMs: 0 })).toBe(0);
  });
});
