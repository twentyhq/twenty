import {
  type FieldPhonesValue,
  type PhoneRecord,
} from '@/object-record/record-field/ui/types/FieldMetadata';
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
  it('should drop legacy additional phones that hold no number', () => {
    const fieldValue = {
      primaryPhoneNumber: '123456789',
      primaryPhoneCountryCode: 'US',
      primaryPhoneCallingCode: '+1',
      additionalPhones: [
        { number: null, callingCode: null, countryCode: null },
        { number: '987654321', callingCode: '+44', countryCode: 'GB' },
      ],
    } as unknown as FieldPhonesValue;

    const result = createPhonesFromFieldValue(fieldValue);

    expect(result).toEqual([
      { number: '123456789', callingCode: '+1', countryCode: 'US' },
      { number: '987654321', callingCode: '+44', countryCode: 'GB' },
    ]);
  });

  it('should coerce legacy additional phones with a null calling or country code', () => {
    const fieldValue = {
      primaryPhoneNumber: '',
      primaryPhoneCountryCode: '',
      additionalPhones: [
        { number: '987654321', callingCode: null, countryCode: undefined },
      ],
    } as unknown as FieldPhonesValue;

    const result = createPhonesFromFieldValue(fieldValue);

    expect(result).toEqual([
      { number: '987654321', callingCode: '', countryCode: '' },
    ]);
  });
});

describe('parsePhonesToFieldValue test suite', () => {
  it('should never return undefined, whatever the input shape', () => {
    const legacyPhones = [
      { number: null, callingCode: null, countryCode: null },
      null,
      undefined,
    ] as unknown as PhoneRecord[];

    expect(parsePhonesToFieldValue([])).toBeDefined();
    expect(parsePhonesToFieldValue(legacyPhones)).toBeDefined();
  });

  it('should always produce a value that satisfies phonesFieldValueSchema', () => {
    const legacyPhones = [
      { number: '123456789', callingCode: null, countryCode: null },
      { number: null, callingCode: '+44', countryCode: 'GB' },
    ] as unknown as PhoneRecord[];

    const result = parsePhonesToFieldValue(legacyPhones);

    expect(phonesFieldValueSchema.safeParse(result).success).toBe(true);
  });

  it('should promote the first usable phone to primary and keep the rest as additional', () => {
    const phones: PhoneRecord[] = [
      { number: '123456789', callingCode: '+1', countryCode: 'US' },
      { number: '987654321', callingCode: '+44', countryCode: 'GB' },
    ];

    expect(parsePhonesToFieldValue(phones)).toEqual({
      primaryPhoneNumber: '123456789',
      primaryPhoneCountryCode: 'US',
      primaryPhoneCallingCode: '+1',
      additionalPhones: [
        { number: '987654321', callingCode: '+44', countryCode: 'GB' },
      ],
    });
  });

  it('should return an empty field value for an empty list', () => {
    expect(parsePhonesToFieldValue([])).toEqual({
      primaryPhoneNumber: '',
      primaryPhoneCountryCode: '',
      primaryPhoneCallingCode: '',
      additionalPhones: [],
    });
  });

  it('should skip unusable entries when choosing the primary phone', () => {
    const legacyPhones = [
      { number: null, callingCode: '+1', countryCode: 'US' },
      { number: '987654321', callingCode: '+44', countryCode: 'GB' },
    ] as unknown as PhoneRecord[];

    expect(parsePhonesToFieldValue(legacyPhones)).toEqual({
      primaryPhoneNumber: '987654321',
      primaryPhoneCountryCode: 'GB',
      primaryPhoneCallingCode: '+44',
      additionalPhones: [],
    });
  });
});
