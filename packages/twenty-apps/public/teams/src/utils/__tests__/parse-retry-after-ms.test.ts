import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { parseRetryAfterMs } from 'src/utils/parse-retry-after-ms';

describe('parseRetryAfterMs', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should convert a delay in seconds to milliseconds', () => {
    expect(parseRetryAfterMs('7')).toBe(7_000);
    expect(parseRetryAfterMs('1.5')).toBe(1_500);
  });

  it('should return the time left until an HTTP date', () => {
    expect(parseRetryAfterMs('Thu, 01 Jan 2026 00:00:30 GMT')).toBe(30_000);
  });

  it('should clamp an HTTP date in the past to zero', () => {
    expect(parseRetryAfterMs('Wed, 31 Dec 2025 23:59:00 GMT')).toBe(0);
  });

  it('should return undefined for an unparseable value', () => {
    expect(parseRetryAfterMs('soon')).toBeUndefined();
  });
});
