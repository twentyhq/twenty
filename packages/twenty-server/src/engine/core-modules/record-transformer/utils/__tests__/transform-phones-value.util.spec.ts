import { transformPhonesValue } from 'src/engine/core-modules/record-transformer/utils/transform-phones-value.util';

describe('transformPhonesValue', () => {
  describe('null/undefined passthrough', () => {
    it('should return null when input is null', () => {
      const result = transformPhonesValue({ input: null });

      expect(result).toBeNull();
    });

    it('should return undefined when input is undefined', () => {
      const result = transformPhonesValue({ input: undefined });

      expect(result).toBeUndefined();
    });
  });

  describe('null-equivalent normalization for unique-constraint safety', () => {
    // Regression for issue #19740:
    // Storing '' in a UNIQUE indexed column causes PostgreSQL to treat two
    // blank rows as duplicates (NULL would be treated as distinct).
    it('should normalize empty primaryPhoneNumber to null', () => {
      const result = transformPhonesValue({
        input: { primaryPhoneNumber: '' },
      });

      expect(result).toEqual({
        additionalPhones: null,
        primaryPhoneNumber: null,
      });
    });

    it('should normalize empty primaryPhoneCallingCode to null', () => {
      const result = transformPhonesValue({
        input: { primaryPhoneCallingCode: '' },
      });

      expect(result).toEqual({
        additionalPhones: null,
        primaryPhoneCallingCode: null,
      });
    });

    it('should normalize empty primaryPhoneCountryCode to null', () => {
      const result = transformPhonesValue({
        input: { primaryPhoneCountryCode: '' },
      });

      expect(result).toEqual({
        additionalPhones: null,
        primaryPhoneCountryCode: null,
      });
    });

    it('should normalize all empty primary fields to null when submitted together', () => {
      const result = transformPhonesValue({
        input: {
          primaryPhoneNumber: '',
          primaryPhoneCallingCode: '',
          primaryPhoneCountryCode: '',
        },
      });

      expect(result).toEqual({
        additionalPhones: null,
        primaryPhoneNumber: null,
        primaryPhoneCallingCode: null,
        primaryPhoneCountryCode: null,
      });
    });

    it('should normalize empty number inside an additionalPhones entry to null and drop unsupplied sub-fields', () => {
      const result = transformPhonesValue({
        input: {
          primaryPhoneNumber: '',
          additionalPhones: JSON.stringify([{ number: '' }]),
        },
      });

      // Only the number was supplied (as empty). callingCode/countryCode were
      // not provided, so they should be absent from the serialized entry rather
      // than forced to null (preserves partial-update semantics).
      expect(result?.additionalPhones).toBe(JSON.stringify([{ number: null }]));
    });
  });

  describe('valid phone input', () => {
    it('should parse a valid international phone number into its canonical parts', () => {
      const result = transformPhonesValue({
        input: { primaryPhoneNumber: '+14155552671' },
      });

      expect(result).toEqual({
        additionalPhones: null,
        primaryPhoneNumber: '4155552671',
        primaryPhoneCallingCode: '+1',
        primaryPhoneCountryCode: 'US',
      });
    });

    it('should preserve a valid calling code and country code supplied with a local number', () => {
      const result = transformPhonesValue({
        input: {
          primaryPhoneNumber: '4155552671',
          primaryPhoneCallingCode: '+1',
          primaryPhoneCountryCode: 'US',
        },
      });

      expect(result).toEqual({
        additionalPhones: null,
        primaryPhoneNumber: '4155552671',
        primaryPhoneCallingCode: '+1',
        primaryPhoneCountryCode: 'US',
      });
    });

    it('should infer callingCode from the number when callingCode is an empty string', () => {
      // Review follow-up: with a valid number, an empty callingCode used to
      // short-circuit the `callingCode ?? inferred` fallback because '' is not
      // nullish, persisting primaryPhoneCallingCode as ''.
      const result = transformPhonesValue({
        input: {
          primaryPhoneNumber: '+14155552671',
          primaryPhoneCallingCode: '',
        },
      });

      expect(result).toEqual({
        additionalPhones: null,
        primaryPhoneNumber: '4155552671',
        primaryPhoneCallingCode: '+1',
        primaryPhoneCountryCode: 'US',
      });
    });
  });

  describe('additionalPhones input shapes', () => {
    // Review follow-up: transformPhonesValue explicitly supports arrays via
    // the isArray branch and integration tests pass arrays. The type must
    // reflect that.
    it('should accept additionalPhones as an array of phone objects', () => {
      const result = transformPhonesValue({
        input: {
          primaryPhoneNumber: '+14155552671',
          additionalPhones: [
            { number: '+442071838750', callingCode: '+44', countryCode: 'GB' },
          ],
        },
      });

      expect(result?.additionalPhones).toBe(
        JSON.stringify([
          { countryCode: 'GB', callingCode: '+44', number: '2071838750' },
        ]),
      );
    });
  });
});
