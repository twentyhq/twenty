import { describe, expect, it } from 'vitest';
import { getPersonWhatsAppRecipient } from 'src/logic-functions/data/get-person-whatsapp-recipient.util';

const NO_PHONE = { primaryPhoneNumber: null, primaryPhoneCallingCode: null };

describe('getPersonWhatsAppRecipient', () => {
  it('should prefer the WhatsApp user ID, then the WhatsApp phone number', () => {
    expect(getPersonWhatsAppRecipient({ whatsAppUserId: 'US.1', whatsAppId: '1650', phones: NO_PHONE })).toBe('US.1');
    expect(getPersonWhatsAppRecipient({ whatsAppUserId: null, whatsAppId: '1650', phones: NO_PHONE })).toBe('1650');
  });

  it('should fall back to the primary phone number in international format', () => {
    expect(
      getPersonWhatsAppRecipient({
        whatsAppUserId: null,
        whatsAppId: null,
        phones: { primaryPhoneNumber: '501 234 567', primaryPhoneCallingCode: '+48' },
      }),
    ).toBe('48501234567');
  });

  it('should find no recipient without any number', () => {
    expect(
      getPersonWhatsAppRecipient({
        whatsAppUserId: null,
        whatsAppId: null,
        phones: { primaryPhoneNumber: '', primaryPhoneCallingCode: '+48' },
      }),
    ).toBeUndefined();
  });
});
