import { describe, expect, it } from 'vitest';

import { hasKvEntryExpired } from 'src/logic-functions/utils/has-kv-entry-expired';

describe('hasKvEntryExpired', () => {
  it('should treat an entry expiring in the future as live', () => {
    expect(hasKvEntryExpired({ expiresAt: Date.now() + 1000 })).toBe(false);
  });

  it('should treat an entry expiring in the past as expired', () => {
    expect(hasKvEntryExpired({ expiresAt: Date.now() - 1000 })).toBe(true);
  });

  it('should treat an entry expiring right now as expired', () => {
    expect(hasKvEntryExpired({ expiresAt: Date.now() })).toBe(true);
  });

  it('should treat an entry without an expiry as expired', () => {
    expect(hasKvEntryExpired({})).toBe(true);
  });
});
