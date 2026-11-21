import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { parseRetryAfterMs } from 'src/utils/parse-retry-after-ms';

describe('parseRetryAfterMs', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: new Date('2026-01-01T00:00:00Z') });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([null, undefined, ''])(
    'should return undefined when the header is %j',
    (retryAfter) => {
      expect(
        parseRetryAfterMs({ retryAfter, shouldParseHttpDate: true }),
      ).toBeUndefined();
    },
  );

  it.each([
    ['3', 3_000],
    ['0.5', 500],
    ['0', 0],
    ['-5', 0],
  ])('should read %j seconds as %i ms', (retryAfter, expectedMs) => {
    expect(parseRetryAfterMs({ retryAfter, shouldParseHttpDate: false })).toBe(
      expectedMs,
    );
  });

  it('should return the time left until an HTTP date', () => {
    expect(
      parseRetryAfterMs({
        retryAfter: 'Thu, 01 Jan 2026 00:00:02 GMT',
        shouldParseHttpDate: true,
      }),
    ).toBe(2_000);
  });

  it('should return zero for an HTTP date in the past', () => {
    expect(
      parseRetryAfterMs({
        retryAfter: 'Wed, 31 Dec 2025 23:59:00 GMT',
        shouldParseHttpDate: true,
      }),
    ).toBe(0);
  });

  it('should ignore an HTTP date when dates are not accepted', () => {
    expect(
      parseRetryAfterMs({
        retryAfter: 'Thu, 01 Jan 2026 00:00:02 GMT',
        shouldParseHttpDate: false,
      }),
    ).toBeUndefined();
  });

  it.each(['soon', 'Infinity'])(
    'should return undefined for the unusable value %j',
    (retryAfter) => {
      expect(
        parseRetryAfterMs({ retryAfter, shouldParseHttpDate: true }),
      ).toBeUndefined();
    },
  );
});
