import { describe, expect, it } from 'vitest';
import { findPersonForWhatsAppIdentity } from 'src/logic-functions/data/find-person-for-whatsapp-identity.util';

const PERSON_BY_PHONE = { id: 'person-by-phone', whatsAppId: '16505551234', whatsAppUserId: null };
const PERSON_BY_USER_ID = { id: 'person-by-user-id', whatsAppId: null, whatsAppUserId: 'US.1' };

describe('findPersonForWhatsAppIdentity', () => {
  it('should prefer the person matching the user ID', () => {
    expect(
      findPersonForWhatsAppIdentity({
        people: [PERSON_BY_PHONE, PERSON_BY_USER_ID],
        identity: { whatsAppId: '16505551234', whatsAppUserId: 'US.1' },
      })?.id,
    ).toBe('person-by-user-id');
  });

  it('should fall back to the phone number', () => {
    expect(
      findPersonForWhatsAppIdentity({
        people: [PERSON_BY_PHONE],
        identity: { whatsAppId: '16505551234', whatsAppUserId: 'US.2' },
      })?.id,
    ).toBe('person-by-phone');
  });

  it('should not match on missing identifiers', () => {
    expect(
      findPersonForWhatsAppIdentity({ people: [PERSON_BY_USER_ID], identity: {} }),
    ).toBeUndefined();
  });
});
