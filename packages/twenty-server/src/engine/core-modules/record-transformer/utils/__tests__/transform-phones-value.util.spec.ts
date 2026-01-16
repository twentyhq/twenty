import { transformPhonesValue } from 'src/engine/core-modules/record-transformer/utils/transform-phones-value.util';

describe('transformPhonesValue', () => {
  it('should handle null/undefined', () => {
    expect(transformPhonesValue({ input: null })).toBeNull();
    expect(transformPhonesValue({ input: undefined })).toBeUndefined();
  });

  describe('primary phone', () => {
    it('should preserve provided calling code', () => {
      const input = {
        primaryPhoneCountryCode: 'US',
        primaryPhoneCallingCode: '+1',
        primaryPhoneNumber: '5551234567',
        additionalPhones: null,
      };

      const result = transformPhonesValue({ input });

      expect(result).toMatchObject({
        primaryPhoneCountryCode: 'US',
        primaryPhoneCallingCode: '+1',
      });
    });

    it('should infer calling code from country code when calling code is empty string', () => {
      // This validates the fix for issue #17182
      const input = {
        primaryPhoneCountryCode: 'IN',
        primaryPhoneCallingCode: '', // Empty string simulating variable mapping
        primaryPhoneNumber: '9999999999',
        additionalPhones: null,
      };

      const result = transformPhonesValue({ input });

      expect(result).toMatchObject({
        primaryPhoneCountryCode: 'IN',
        primaryPhoneCallingCode: '+91', // Should be inferred
        primaryPhoneNumber: '9999999999',
      });
    });

    it('should infer calling code from E.164 number when calling code and country empty', () => {
      const input = {
        primaryPhoneCountryCode: '',
        primaryPhoneCallingCode: '',
        primaryPhoneNumber: '+33612345678', // France
        additionalPhones: null,
      };

      const result = transformPhonesValue({ input });

      expect(result).toMatchObject({
        primaryPhoneCountryCode: 'FR',
        primaryPhoneCallingCode: '+33',
        primaryPhoneNumber: '612345678', // libphonenumber might strip the +33? Actually the util usually splits it.
      });
    });
  });
});
