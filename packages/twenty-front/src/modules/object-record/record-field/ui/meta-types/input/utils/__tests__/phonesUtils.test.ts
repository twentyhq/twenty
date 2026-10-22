import { type FieldPhonesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import {
  createPhonesFromFieldValue,
  parsePhonesToFieldValue,
} from '@/object-record/record-field/ui/meta-types/input/utils/phonesUtils';
import { phonesFieldValueSchema } from '@/object-record/record-field/ui/validation-schemas/phonesFieldValueSchema';

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

  it('should return an array with primary phone number if its country and calling codes are null', () => {
    const fieldValue: FieldPhonesValue = {
      primaryPhoneNumber: '123456789',
      primaryPhoneCountryCode: null,
      primaryPhoneCallingCode: null,
      additionalPhones: null,
    };
    const result = createPhonesFromFieldValue(fieldValue);
    expect(result).toEqual([
      { number: '123456789', callingCode: '', countryCode: '' },
    ]);
  });

  it('should return an empty array if the primary phone number is null', () => {
    const fieldValue: FieldPhonesValue = {
      primaryPhoneNumber: null,
      primaryPhoneCountryCode: null,
      primaryPhoneCallingCode: null,
      additionalPhones: null,
    };
    const result = createPhonesFromFieldValue(fieldValue);
    expect(result).toEqual([]);
  });

  it('should default the null subfields of an additional phone', () => {
    const fieldValue: FieldPhonesValue = {
      primaryPhoneNumber: '123456789',
      primaryPhoneCountryCode: 'FR',
      primaryPhoneCallingCode: '+33',
      additionalPhones: [
        { number: '987654321', callingCode: null, countryCode: null },
      ],
    };
    const result = createPhonesFromFieldValue(fieldValue);
    expect(result).toEqual([
      { number: '123456789', callingCode: '+33', countryCode: 'FR' },
      { number: '987654321', callingCode: '', countryCode: '' },
    ]);
  });

  it('should drop additional phones that have no number', () => {
    const fieldValue: FieldPhonesValue = {
      primaryPhoneNumber: '123456789',
      primaryPhoneCountryCode: 'FR',
      primaryPhoneCallingCode: '+33',
      additionalPhones: [
        { number: '', callingCode: '', countryCode: '' },
        { number: '987654321', callingCode: '+44', countryCode: 'GB' },
        { number: null, callingCode: null, countryCode: null },
      ],
    };
    const result = createPhonesFromFieldValue(fieldValue);
    expect(result).toEqual([
      { number: '123456789', callingCode: '+33', countryCode: 'FR' },
      { number: '987654321', callingCode: '+44', countryCode: 'GB' },
    ]);
  });
});

describe('parsePhonesToFieldValue test suite', () => {
  it('should never return undefined', () => {
    expect(parsePhonesToFieldValue([])).toBeDefined();
    expect(
      parsePhonesToFieldValue([
        { number: '', callingCode: '+1', countryCode: 'US' },
      ]),
    ).toBeDefined();
  });

  it('should always satisfy phonesFieldValueSchema', () => {
    const cases = [
      [],
      [{ number: '123456789', callingCode: '+1', countryCode: 'US' }],
      [
        { number: '123456789', callingCode: '+1', countryCode: 'US' },
        { number: '987654321', callingCode: '+44', countryCode: 'GB' },
      ],
      [{ number: '', callingCode: '', countryCode: '' }],
    ];

    for (const phones of cases) {
      expect(
        phonesFieldValueSchema.safeParse(parsePhonesToFieldValue(phones))
          .success,
      ).toBe(true);
    }
  });

  it('should promote the first usable phone as primary', () => {
    const result = parsePhonesToFieldValue([
      { number: '', callingCode: '+1', countryCode: 'US' },
      { number: '987654321', callingCode: '+44', countryCode: 'GB' },
      { number: '555555555', callingCode: '+33', countryCode: 'FR' },
    ]);

    expect(result).toEqual({
      primaryPhoneNumber: '987654321',
      primaryPhoneCountryCode: 'GB',
      primaryPhoneCallingCode: '+44',
      additionalPhones: [
        { number: '555555555', callingCode: '+33', countryCode: 'FR' },
      ],
    });
  });

  it('should coerce nullish codes on additional phones', () => {
    const result = parsePhonesToFieldValue([
      { number: '123456789', callingCode: '+1', countryCode: 'US' },
      {
        number: '987654321',
        callingCode: null as unknown as string,
        countryCode: null as unknown as string,
      },
    ]);

    expect(result).toEqual({
      primaryPhoneNumber: '123456789',
      primaryPhoneCountryCode: 'US',
      primaryPhoneCallingCode: '+1',
      additionalPhones: [
        { number: '987654321', callingCode: '', countryCode: '' },
      ],
    });
  });

  it('should return empty primary fields when there are no usable phones', () => {
    expect(parsePhonesToFieldValue([])).toEqual({
      primaryPhoneNumber: '',
      primaryPhoneCountryCode: '',
      primaryPhoneCallingCode: '',
      additionalPhones: [],
    });
  });
});
