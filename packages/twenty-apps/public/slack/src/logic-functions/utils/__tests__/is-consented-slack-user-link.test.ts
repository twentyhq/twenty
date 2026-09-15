import { describe, expect, it } from 'vitest';

import { isConsentedSlackUserLink } from 'src/logic-functions/utils/is-consented-slack-user-link';

describe('isConsentedSlackUserLink', () => {
  it('should treat ACTIVE as consented', () => {
    expect(isConsentedSlackUserLink('ACTIVE')).toBe(true);
  });

  it('should treat ADMIN_SET as consented', () => {
    expect(isConsentedSlackUserLink('ADMIN_SET')).toBe(true);
  });

  it('should not treat PENDING as consented', () => {
    expect(isConsentedSlackUserLink('PENDING')).toBe(false);
  });

  it('should not treat DECLINED as consented', () => {
    expect(isConsentedSlackUserLink('DECLINED')).toBe(false);
  });

  it('should treat a legacy link without a consent state as consented', () => {
    expect(isConsentedSlackUserLink(undefined)).toBe(true);
  });
});
