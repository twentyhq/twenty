import { describe, expect, it } from 'vitest';

import { parseRetryAfterMs } from 'src/logic-functions/utils/parse-retry-after-ms.util';

const NOW_MS = Date.parse('2026-01-01T13:00:00.000Z');
const MAX_RETRY_AFTER_MS = 60_000;

describe('parseRetryAfterMs', () => {
  it('parses delay-seconds into milliseconds', () => {
    expect(parseRetryAfterMs('9', NOW_MS, MAX_RETRY_AFTER_MS)).toBe(9_000);
  });

  it('caps delay-seconds at the retry-after ceiling', () => {
    expect(parseRetryAfterMs('120', NOW_MS, MAX_RETRY_AFTER_MS)).toBe(60_000);
  });

  it('parses an HTTP-date into a delay from now', () => {
    expect(
      parseRetryAfterMs(
        'Thu, 01 Jan 2026 13:00:05 GMT',
        NOW_MS,
        MAX_RETRY_AFTER_MS,
      ),
    ).toBe(5_000);
  });

  it('clamps an HTTP-date in the past to zero', () => {
    expect(
      parseRetryAfterMs(
        'Thu, 01 Jan 2026 12:59:00 GMT',
        NOW_MS,
        MAX_RETRY_AFTER_MS,
      ),
    ).toBe(0);
  });

  it.each(['0x10', '1e2', '1.5', '-5', '+9', 'Infinity'])(
    'rejects the malformed delay-seconds form %s',
    (retryAfterHeader) => {
      expect(
        parseRetryAfterMs(retryAfterHeader, NOW_MS, MAX_RETRY_AFTER_MS),
      ).toBeUndefined();
    },
  );

  it('rejects values that are neither delay-seconds nor a date', () => {
    expect(
      parseRetryAfterMs('soon', NOW_MS, MAX_RETRY_AFTER_MS),
    ).toBeUndefined();
    expect(
      parseRetryAfterMs('   ', NOW_MS, MAX_RETRY_AFTER_MS),
    ).toBeUndefined();
    expect(parseRetryAfterMs(null, NOW_MS, MAX_RETRY_AFTER_MS)).toBeUndefined();
  });
});
