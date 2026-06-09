import { describe, expect, it } from 'vitest';

import { isWithinTtl } from 'src/logic-functions/utils/is-within-ttl';

describe('isWithinTtl', () => {
  it('is true for a recent timestamp', () => {
    expect(isWithinTtl({ lastEnrichedAt: new Date().toISOString() })).toBe(true);
  });

  it('is false for a timestamp older than the TTL', () => {
    const oldTimestamp = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    expect(isWithinTtl({ lastEnrichedAt: oldTimestamp })).toBe(false);
  });

  it('is false for missing or unparseable timestamps', () => {
    expect(isWithinTtl({ lastEnrichedAt: null })).toBe(false);
    expect(isWithinTtl({ lastEnrichedAt: undefined })).toBe(false);
    expect(isWithinTtl({ lastEnrichedAt: 'not-a-date' })).toBe(false);
  });
});
