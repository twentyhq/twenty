import { coercePhonesFieldOrThrow } from 'src/engine/api/common/common-args-handlers/data-arg-handler/coercer-utils/coerce-phones-field-or-throw.util';

describe('coercePhonesFieldOrThrow', () => {
  describe('valid inputs', () => {
    it('should return null when value is null', () => {
      const result = coercePhonesFieldOrThrow(null, 'phones');

      expect(result).toBeNull();
    });

    it('should return null when value is an empty object', () => {
      const result = coercePhonesFieldOrThrow({}, 'phones');

      expect(result).toBeNull();
    });

    it('should return transformed phones when value contains only primaryPhoneNumber with country code', () => {
      const phones = {
        primaryPhoneNumber: '2025550123',
        primaryPhoneCountryCode: 'US',
      };
      const result = coercePhonesFieldOrThrow(phones, 'phones');

      expect(result).toBeDefined();
      expect(result).toHaveProperty('primaryPhoneNumber');
    });

    it('should return transformed phones when value contains primaryPhoneNumber and countryCode', () => {
      const phones = {
        primaryPhoneNumber: '2025550123',
        primaryPhoneCountryCode: 'US',
      };
      const result = coercePhonesFieldOrThrow(phones, 'phones');

      expect(result).toBeDefined();
      expect(result).toHaveProperty('primaryPhoneNumber');
      expect(result).toHaveProperty('primaryPhoneCountryCode');
    });

    it('should return transformed phones when value contains primaryPhoneNumber, countryCode, and callingCode', () => {
      const phones = {
        primaryPhoneNumber: '2025550123',
        primaryPhoneCountryCode: 'US',
        primaryPhoneCallingCode: '+1',
      };
      const result = coercePhonesFieldOrThrow(phones, 'phones');

      expect(result).toBeDefined();
      expect(result).toHaveProperty('primaryPhoneNumber');
      expect(result).toHaveProperty('primaryPhoneCountryCode');
      expect(result).toHaveProperty('primaryPhoneCallingCode');
    });

    it('should return transformed phones when value contains additionalPhones as JSON string', () => {
      const phones = {
        primaryPhoneNumber: '2025550123',
        primaryPhoneCountryCode: 'US',
        additionalPhones: JSON.stringify([
          {
            number: '2025550456',
            countryCode: 'US',
            callingCode: '+1',
          },
        ]),
      };
      const result = coercePhonesFieldOrThrow(phones, 'phones');

      expect(result).toBeDefined();
      expect(result).toHaveProperty('primaryPhoneNumber');
      expect(result).toHaveProperty('additionalPhones');
    });

    it('should return transformed phones when value contains all valid subfields', () => {
      const phones = {
        primaryPhoneNumber: '2025550123',
        primaryPhoneCountryCode: 'US',
        primaryPhoneCallingCode: '+1',
        additionalPhones: null,
      };
      const result = coercePhonesFieldOrThrow(phones, 'phones');

      expect(result).toBeDefined();
    });
  });

  describe('invalid inputs', () => {
    it('should throw when value is a string', () => {
      expect(() => coercePhonesFieldOrThrow('1234567890', 'phones')).toThrow(
        'Invalid value \'1234567890\' for phones field "phones"',
      );
    });

    it('should throw when value is an array', () => {
      expect(() =>
        coercePhonesFieldOrThrow(['1234567890', '0987654321'], 'phones'),
      ).toThrow(
        "Invalid value [ '1234567890', '0987654321' ] for phones field \"phones\"",
      );
    });

    it('should throw when value contains an invalid subfield name', () => {
      const phones = {
        primaryPhoneNumber: '2025550123',
        invalidField: 'invalid',
      };

      expect(() => coercePhonesFieldOrThrow(phones, 'phones')).toThrow(
        "Invalid value { primaryPhoneNumber: '2025550123', invalidField: 'invalid' } for phones field \"phones\"",
      );
    });

    it('should throw when primaryPhoneNumber is invalid without country context', () => {
      const phones = {
        primaryPhoneNumber: '123',
      };

      expect(() => coercePhonesFieldOrThrow(phones, 'phones')).toThrow(
        'Invalid value { primaryPhoneNumber: \'123\' } for phones field "phones"',
      );
    });

    it('should throw when primaryPhoneCountryCode is invalid', () => {
      const phones = {
        primaryPhoneNumber: '2025550123',
        primaryPhoneCountryCode: 'INVALID',
      };

      expect(() => coercePhonesFieldOrThrow(phones, 'phones')).toThrow(
        'Invalid country code INVALID',
      );
    });

    it('should throw when primaryPhoneCallingCode is invalid', () => {
      const phones = {
        primaryPhoneNumber: '2025550123',
        primaryPhoneCallingCode: '+999',
      };

      expect(() => coercePhonesFieldOrThrow(phones, 'phones')).toThrow(
        'Invalid calling code +999',
      );
    });

    it('should throw when country code and calling code are conflicting', () => {
      const phones = {
        primaryPhoneNumber: '2025550123',
        primaryPhoneCountryCode: 'US',
        primaryPhoneCallingCode: '+44',
      };

      expect(() => coercePhonesFieldOrThrow(phones, 'phones')).toThrow(
        'Provided country code and calling code are conflicting',
      );
    });
  });
});
