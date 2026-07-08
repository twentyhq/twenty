import { describe, expect, it } from 'vitest';

import { RECALL_API_MAX_RETRY_AFTER_MS } from 'src/logic-functions/constants/recall-api-max-retry-after-ms';
import { parseRecallRetryAfterMs } from 'src/logic-functions/recall-api/parse-recall-retry-after.util';

const NOW_MS = 1_000_000;

describe('parseRecallRetryAfterMs', () => {
  it('returns undefined when the header is absent', () => {
    expect(parseRecallRetryAfterMs(null, NOW_MS)).toBeUndefined();
  });

  it('returns undefined for an unparseable header', () => {
    expect(parseRecallRetryAfterMs('soon', NOW_MS)).toBeUndefined();
  });

  it('converts delta-seconds to milliseconds', () => {
    expect(parseRecallRetryAfterMs('2', NOW_MS)).toBe(2000);
  });

  it('treats a non-positive delay as zero', () => {
    expect(parseRecallRetryAfterMs('0', NOW_MS)).toBe(0);
    expect(parseRecallRetryAfterMs('-5', NOW_MS)).toBe(0);
  });

  it('parses an HTTP date relative to now', () => {
    const httpDate = new Date(NOW_MS + 3000).toUTCString();

    expect(parseRecallRetryAfterMs(httpDate, NOW_MS)).toBe(3000);
  });

  it('caps an oversized delay at the maximum', () => {
    expect(parseRecallRetryAfterMs('100000', NOW_MS)).toBe(
      RECALL_API_MAX_RETRY_AFTER_MS,
    );
  });
});
