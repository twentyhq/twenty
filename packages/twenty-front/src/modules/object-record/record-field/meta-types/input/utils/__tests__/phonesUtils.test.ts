import { FieldPhonesValue } from '@/object-record/record-field/types/FieldMetadata';
import { createPhonesFromFieldValue } from '../phonesUtils';

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
      primaryPhoneCountryCode: '+1',
      additionalPhones: [],
    };
    const result = createPhonesFromFieldValue(fieldValue);
    expect(result).toEqual([
      {
        number: '123456789',
        callingCode: '+1',
      },
    ]);
  });

  it('should return an array with both primary and additional phones if they are defined', () => {
    const fieldValue: FieldPhonesValue = {
      primaryPhoneNumber: '123456789',
      primaryPhoneCountryCode: '+1',
      additionalPhones: [
        { number: '987654321', callingCode: '+44' },
        { number: '555555555', callingCode: '+33' },
      ],
    };
    const result = createPhonesFromFieldValue(fieldValue);
    expect(result).toEqual([
      {
        number: '123456789',
        callingCode: '+1',
      },
      { number: '987654321', callingCode: '+44' },
      { number: '555555555', callingCode: '+33' },
    ]);
  });

  it('should return an array with additional phones if they are defined while no primary phone defined', () => {
    const fieldValue: FieldPhonesValue = {
      primaryPhoneNumber: '',
      primaryPhoneCountryCode: '',
      additionalPhones: [
        { number: '987654321', callingCode: '+44' },
        { number: '555555555', callingCode: '+33' },
      ],
    };
    const result = createPhonesFromFieldValue(fieldValue);
    expect(result).toEqual([
      { number: '987654321', callingCode: '+44' },
      { number: '555555555', callingCode: '+33' },
    ]);
  });

  it('should return an array with  both primary and additional phones if they are defined, with primary as an extra space', () => {
    const fieldValue: FieldPhonesValue = {
      primaryPhoneNumber: ' ',
      primaryPhoneCountryCode: '',
      additionalPhones: [
        { number: '987654321', callingCode: '+44' },
        { number: '555555555', callingCode: '+33' },
      ],
    };
    const result = createPhonesFromFieldValue(fieldValue);
    expect(result).toEqual([
      { number: ' ', callingCode: '' },
      { number: '987654321', callingCode: '+44' },
      { number: '555555555', callingCode: '+33' },
    ]);
  });

  it('should return an empty array if only country code is defined', () => {
    const fieldValue: FieldPhonesValue = {
      primaryPhoneNumber: '',
      primaryPhoneCountryCode: '+33',
      additionalPhones: [],
    };
    const result = createPhonesFromFieldValue(fieldValue);
    expect(result).toEqual([]);
  });
});
