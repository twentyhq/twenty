import { describe, expect, it } from 'vitest';
import { getRecipientWhatsAppIdentity } from 'src/logic-functions/data/get-recipient-whatsapp-identity.util';

describe('getRecipientWhatsAppIdentity', () => {
  it('should read a business-scoped user ID as a user ID', () => {
    expect(getRecipientWhatsAppIdentity('US.13491208655302741918')).toEqual({
      whatsAppUserId: 'US.13491208655302741918',
    });
  });

  it('should read anything else as a phone number, keeping only its digits', () => {
    expect(getRecipientWhatsAppIdentity('+1 650-555-1234')).toEqual({ whatsAppId: '16505551234' });
  });
});
