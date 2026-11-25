import { describe, expect, it } from 'vitest';
import { isSameWhatsAppIdentity } from 'src/logic-functions/data/is-same-whatsapp-identity.util';

describe('isSameWhatsAppIdentity', () => {
  it('should match on the user ID', () => {
    expect(isSameWhatsAppIdentity({ whatsAppUserId: 'US.1' }, { whatsAppId: '1650', whatsAppUserId: 'US.1' })).toBe(true);
  });

  it('should match on the phone number', () => {
    expect(isSameWhatsAppIdentity({ whatsAppId: '1650' }, { whatsAppId: '1650' })).toBe(true);
  });

  it('should not match two identities without identifiers', () => {
    expect(isSameWhatsAppIdentity({}, {})).toBe(false);
  });
});
