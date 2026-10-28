import {
  RecordTransformerException,
  RecordTransformerExceptionCode,
} from 'src/engine/core-modules/record-transformer/record-transformer.exception';
import { transformPhonesValue } from 'src/engine/core-modules/record-transformer/utils/transform-phones-value.util';

describe('transformPhonesValue', () => {
  it('should return null when input is null', () => {
    const result = transformPhonesValue({ input: null });

    expect(result).toBeNull();
  });

  it('should normalize all empty primary sub-fields to null', () => {
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

  it('should drop an additionalPhones entry that has no number', () => {
    const result = transformPhonesValue({
      input: {
        primaryPhoneNumber: '',
        additionalPhones: JSON.stringify([{ number: '' }]),
      },
    });

    expect(result?.additionalPhones).toBeNull();
  });

  it('should keep valid additionalPhones entries while dropping numberless ones', () => {
    const result = transformPhonesValue({
      input: {
        primaryPhoneNumber: '',
        additionalPhones: JSON.stringify([
          { number: '' },
          { number: '+442071838750', callingCode: '+44', countryCode: 'GB' },
        ]),
      },
    });

    expect(result?.additionalPhones).toBe(
      JSON.stringify([
        { countryCode: 'GB', callingCode: '+44', number: '2071838750' },
      ]),
    );
  });

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

  it('should infer callingCode from the number when callingCode is an empty string', () => {
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

  describe('phone number length and content validation', () => {
    const transformBulgarianNumber = (primaryPhoneNumber: string) =>
      transformPhonesValue({
        input: { primaryPhoneNumber, primaryPhoneCallingCode: '+359' },
      });

    it.each(['12', '888'])(
      'should reject %s because it is too short to be a phone number',
      (number) => {
        expect(() => transformBulgarianNumber(number)).toThrow(
          expect.objectContaining({
            code: RecordTransformerExceptionCode.INVALID_PHONE_NUMBER,
          }),
        );
      },
    );

    it('should reject a number with more than 15 digits', () => {
      expect(() => transformBulgarianNumber('08812345678901234')).toThrow(
        RecordTransformerException,
      );
    });

    it.each(['088-ABC', '0881234567-ABC', '088 123 4567 abc'])(
      'should reject %s instead of silently dropping the letters',
      (number) => {
        expect(() => transformBulgarianNumber(number)).toThrow(
          expect.objectContaining({
            code: RecordTransformerExceptionCode.INVALID_PHONE_NUMBER,
          }),
        );
      },
    );

    it('should still reject a value without any digit', () => {
      expect(() => transformBulgarianNumber('abc')).toThrow(
        RecordTransformerException,
      );
    });

    it.each(['+359 88 123 4567', '0881234567', '088 123 4567', '881234567'])(
      'should accept the valid Bulgarian number %s',
      (number) => {
        const result = transformBulgarianNumber(number);

        expect(result).toEqual({
          additionalPhones: null,
          primaryPhoneNumber: '881234567',
          primaryPhoneCallingCode: '+359',
          primaryPhoneCountryCode: 'BG',
        });
      },
    );

    it('should reject an invalid number in additionalPhones', () => {
      expect(() =>
        transformPhonesValue({
          input: {
            primaryPhoneNumber: '+14155552671',
            additionalPhones: [{ number: '12', callingCode: '+359' }],
          },
        }),
      ).toThrow(RecordTransformerException);
    });
  });
});
