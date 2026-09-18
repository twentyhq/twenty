import { type FieldPhonesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { createPhonesFromFieldValue } from '@/object-record/record-field/ui/meta-types/input/utils/phonesUtils';

describe('createPhonesFromFieldValue test suite', () => {
  it('should return an empty array if fieldValue is undefined', () => {
    const result = createPhonesFromFieldValue(
      undefined as unknown as FieldPhonesValue,
    );
    expect(result).toEqual([]);
  });

  it('should return an empty array if fieldValue is null', () => {
    const result = createPhonesFromFieldValue(
      null as unknown as FieldPhonesValue,
    );
    expect(result).toEqual([]);
  });

  it('should return an array with primary phone number if it is defined', () => {
    const fieldValue: FieldPhonesValue = {
      primaryPhoneNumber: '123456789',
      primaryPhoneCountryCode: 'US',
      primaryPhoneCallingCode: '+1',
      additionalPhones: [],
    };
    const result = createPhonesFromFieldValue(fieldValue);
    expect(result).toEqual([
      {
        number: '123456789',
        callingCode: '+1',
        countryCode: 'US',
      },
    ]);
  });

  it('should return an array with primary phone number if it is defined, even with incorrect callingCode', () => {
    const fieldValue: FieldPhonesValue = {
      primaryPhoneNumber: '123456789',
      primaryPhoneCountryCode: 'US',
      primaryPhoneCallingCode: '+33',
      additionalPhones: [],
    };
    const result = createPhonesFromFieldValue(fieldValue);
    expect(result).toEqual([
      {
        number: '123456789',
        callingCode: '+33',
        countryCode: 'US',
      },
    ]);
  });

  it('should return an array with both primary and additional phones if they are defined', () => {
    const fieldValue: FieldPhonesValue = {
      primaryPhoneNumber: '123456789',
      primaryPhoneCountryCode: 'US',
      primaryPhoneCallingCode: '+1',
      additionalPhones: [
        { number: '987654321', callingCode: '+44', countryCode: 'GB' },
        { number: '555555555', callingCode: '+33', countryCode: 'FR' },
      ],
    };
    const result = createPhonesFromFieldValue(fieldValue);
    expect(result).toEqual([
      {
        number: '123456789',
        callingCode: '+1',
        countryCode: 'US',
      },
      { number: '987654321', callingCode: '+44', countryCode: 'GB' },
      { number: '555555555', callingCode: '+33', countryCode: 'FR' },
    ]);
  });

  it('should return an array with additional phones if they are defined while no primary phone defined', () => {
    const fieldValue: FieldPhonesValue = {
      primaryPhoneNumber: '',
      primaryPhoneCountryCode: '',
      additionalPhones: [
        { number: '987654321', callingCode: '+44', countryCode: 'GB' },
        { number: '555555555', callingCode: '+33', countryCode: 'FR' },
      ],
    };
    const result = createPhonesFromFieldValue(fieldValue);
    expect(result).toEqual([
      { number: '987654321', callingCode: '+44', countryCode: 'GB' },
      { number: '555555555', callingCode: '+33', countryCode: 'FR' },
    ]);
  });

  it('should return an array with  both primary and additional phones if they are defined, with primary as an extra space', () => {
    const fieldValue: FieldPhonesValue = {
      primaryPhoneNumber: ' ',
      primaryPhoneCountryCode: '',
      additionalPhones: [
        { number: '987654321', callingCode: '+44', countryCode: 'GB' },
        { number: '555555555', callingCode: '+33', countryCode: 'FR' },
      ],
    };
    const result = createPhonesFromFieldValue(fieldValue);
    expect(result).toEqual([
      { number: ' ', callingCode: '', countryCode: '' },
      { number: '987654321', callingCode: '+44', countryCode: 'GB' },
      { number: '555555555', callingCode: '+33', countryCode: 'FR' },
    ]);
  });

  it('should return an empty array if only country and calling code are defined', () => {
    const fieldValue: FieldPhonesValue = {
      primaryPhoneNumber: '',
      primaryPhoneCountryCode: 'FR',
      primaryPhoneCallingCode: '+33',
      additionalPhones: [],
    };
    const result = createPhonesFromFieldValue(fieldValue);
    expect(result).toEqual([]);
  });

  it('should return an empty array if only calling code is defined', () => {
    const fieldValue: FieldPhonesValue = {
      primaryPhoneNumber: '',
      primaryPhoneCallingCode: '+33',
      primaryPhoneCountryCode: '',
      additionalPhones: [],
    };
    const result = createPhonesFromFieldValue(fieldValue);
    expect(result).toEqual([]);
  });

  it('should complete an additional phone missing its country code', () => {
    const fieldValue = {
      primaryPhoneNumber: '123456789',
      primaryPhoneCountryCode: 'US',
      primaryPhoneCallingCode: '+1',
      additionalPhones: [{ number: '987654321', callingCode: '+44' }],
    } as unknown as FieldPhonesValue;

    const result = createPhonesFromFieldValue(fieldValue);

    expect(result).toEqual([
      { number: '123456789', callingCode: '+1', countryCode: 'US' },
      { number: '987654321', callingCode: '+44', countryCode: '' },
    ]);
  });

  it('should complete an additional phone missing its calling code', () => {
    const fieldValue = {
      primaryPhoneNumber: '',
      primaryPhoneCountryCode: '',
      additionalPhones: [{ number: '987654321', countryCode: 'GB' }],
    } as unknown as FieldPhonesValue;

    const result = createPhonesFromFieldValue(fieldValue);

    expect(result).toEqual([
      { number: '987654321', callingCode: '', countryCode: 'GB' },
    ]);
  });

  it('should complete an additional phone whose codes are null', () => {
    const fieldValue = {
      primaryPhoneNumber: '',
      primaryPhoneCountryCode: '',
      additionalPhones: [
        { number: '987654321', callingCode: null, countryCode: null },
      ],
    } as unknown as FieldPhonesValue;

    const result = createPhonesFromFieldValue(fieldValue);

    expect(result).toEqual([
      { number: '987654321', callingCode: '', countryCode: '' },
    ]);
  });

  it('should drop an additional phone without a number', () => {
    const fieldValue = {
      primaryPhoneNumber: '',
      primaryPhoneCountryCode: '',
      additionalPhones: [
        { number: '', callingCode: '+44', countryCode: 'GB' },
        { callingCode: '+33', countryCode: 'FR' },
        null,
      ],
    } as unknown as FieldPhonesValue;

    const result = createPhonesFromFieldValue(fieldValue);

    expect(result).toEqual([]);
  });

  it('should keep well-formed additional phones when one of them is malformed', () => {
    const fieldValue = {
      primaryPhoneNumber: '',
      primaryPhoneCountryCode: '',
      additionalPhones: [
        { number: '987654321', callingCode: '+44', countryCode: 'GB' },
        { number: '555555555' },
        { number: '111222333', callingCode: '+33', countryCode: 'FR' },
      ],
    } as unknown as FieldPhonesValue;

    const result = createPhonesFromFieldValue(fieldValue);

    expect(result).toEqual([
      { number: '987654321', callingCode: '+44', countryCode: 'GB' },
      { number: '555555555', callingCode: '', countryCode: '' },
      { number: '111222333', callingCode: '+33', countryCode: 'FR' },
    ]);
  });
});
