import { describe, expect, it } from 'vitest';
import { normalizeWhatsAppPhoneNumber } from 'src/logic-functions/data/normalize-whatsapp-phone-number.util';
import { parseWhatsAppPhoneNumber } from 'src/logic-functions/data/parse-whatsapp-phone-number.util';

describe('normalizeWhatsAppPhoneNumber', () => {
  it('should keep only the digits of a display phone number', () => {
    expect(normalizeWhatsAppPhoneNumber('+1 (555) 078-3881')).toBe('15550783881');
  });
});

describe('parseWhatsAppPhoneNumber', () => {
  it('should parse a WhatsApp number without the leading plus into Twenty phone fields', () => {
    expect(parseWhatsAppPhoneNumber('48501234567')).toEqual({
      primaryPhoneNumber: '501234567',
      primaryPhoneCallingCode: '+48',
      primaryPhoneCountryCode: 'PL',
    });
  });

  it('should return undefined for an invalid number', () => {
    expect(parseWhatsAppPhoneNumber('not-a-number')).toBeUndefined();
  });
});
