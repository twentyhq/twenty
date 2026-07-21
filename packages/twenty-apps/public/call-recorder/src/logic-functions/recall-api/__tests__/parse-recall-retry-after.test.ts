import { describe, expect, it } from 'vitest';

import { parseRecallRetryAfterMs } from 'src/logic-functions/recall-api/parse-recall-retry-after.util';

const NOW_MS = Date.parse('2026-01-01T13:00:00.000Z');

describe('parseRecallRetryAfterMs', () => {
  it('parses delay-seconds into milliseconds', () => {
    expect(parseRecallRetryAfterMs('9', NOW_MS)).toBe(9_000);
  });

  it('caps delay-seconds at the retry-after ceiling', () => {
    expect(parseRecallRetryAfterMs('120', NOW_MS)).toBe(60_000);
  });

  it('parses an HTTP-date into a delay from now', () => {
    expect(
      parseRecallRetryAfterMs('Thu, 01 Jan 2026 13:00:05 GMT', NOW_MS),
    ).toBe(5_000);
  });

  it('clamps an HTTP-date in the past to zero', () => {
    expect(
      parseRecallRetryAfterMs('Thu, 01 Jan 2026 12:59:00 GMT', NOW_MS),
    ).toBe(0);
  });

  it.each(['0x10', '1e2', '1.5', '-5', '+9', 'Infinity'])(
    'rejects the malformed delay-seconds form %s',
    (retryAfterHeader) => {
      expect(parseRecallRetryAfterMs(retryAfterHeader, NOW_MS)).toBeUndefined();
    },
  );

  it('rejects values that are neither delay-seconds nor a date', () => {
    expect(parseRecallRetryAfterMs('soon', NOW_MS)).toBeUndefined();
    expect(parseRecallRetryAfterMs('   ', NOW_MS)).toBeUndefined();
    expect(parseRecallRetryAfterMs(null, NOW_MS)).toBeUndefined();
  });
});
