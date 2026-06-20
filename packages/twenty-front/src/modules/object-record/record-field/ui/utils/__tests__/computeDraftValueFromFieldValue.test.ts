import { computeDraftValueFromFieldValue } from '@/object-record/record-field/ui/utils/computeDraftValueFromFieldValue';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const emptyPhonesValue = {
  primaryPhoneNumber: '',
  primaryPhoneCountryCode: '',
  primaryPhoneCallingCode: '',
  additionalPhones: null,
};

const basePhonesFieldDefinition = {
  type: FieldMetadataType.PHONES,
  metadata: {
    fieldName: 'phones',
    settings: null,
  },
  defaultValue: null,
} as const;

describe('computeDraftValueFromFieldValue - phones', () => {
  it('should return field value unchanged when no default country configured', () => {
    const result = computeDraftValueFromFieldValue({
      fieldDefinition: basePhonesFieldDefinition,
      fieldValue: emptyPhonesValue,
    });

    expect(result).toEqual(emptyPhonesValue);
  });

  it('should apply defaultValue.primaryPhoneCountryCode when set', () => {
    const fieldDefinition = {
      ...basePhonesFieldDefinition,
      defaultValue: {
        primaryPhoneNumber: "''",
        primaryPhoneCountryCode: "'US'",
        primaryPhoneCallingCode: "'+1'",
        additionalPhones: null,
      },
    };

    const result = computeDraftValueFromFieldValue({
      fieldDefinition,
      fieldValue: emptyPhonesValue,
    });

    expect(result).toMatchObject({
      primaryPhoneCountryCode: 'US',
      primaryPhoneCallingCode: '+1',
    });
  });

  it('should apply settings.defaultCountryCode when defaultValue.primaryPhoneCountryCode is absent', () => {
    const fieldDefinition = {
      ...basePhonesFieldDefinition,
      metadata: {
        fieldName: 'phones',
        settings: { defaultCountryCode: 'CZ' },
      },
      defaultValue: null,
    };

    const result = computeDraftValueFromFieldValue({
      fieldDefinition,
      fieldValue: emptyPhonesValue,
    });

    expect(result).toMatchObject({
      primaryPhoneCountryCode: 'CZ',
    });
  });

  it('should prefer defaultValue.primaryPhoneCountryCode over settings.defaultCountryCode', () => {
    const fieldDefinition = {
      ...basePhonesFieldDefinition,
      metadata: {
        fieldName: 'phones',
        settings: { defaultCountryCode: 'CZ' },
      },
      defaultValue: {
        primaryPhoneNumber: "''",
        primaryPhoneCountryCode: "'US'",
        primaryPhoneCallingCode: "'+1'",
        additionalPhones: null,
      },
    };

    const result = computeDraftValueFromFieldValue({
      fieldDefinition,
      fieldValue: emptyPhonesValue,
    });

    expect(result).toMatchObject({
      primaryPhoneCountryCode: 'US',
    });
  });

  it('should not fall back to settings.defaultCountryCode when defaultValue.primaryPhoneCountryCode is explicitly empty string', () => {
    const fieldDefinition = {
      ...basePhonesFieldDefinition,
      metadata: {
        fieldName: 'phones',
        settings: { defaultCountryCode: 'CZ' },
      },
      defaultValue: {
        primaryPhoneNumber: "''",
        primaryPhoneCountryCode: "''",
        primaryPhoneCallingCode: "''",
        additionalPhones: null,
      },
    };

    const result = computeDraftValueFromFieldValue({
      fieldDefinition,
      fieldValue: emptyPhonesValue,
    });

    expect(result).toEqual(emptyPhonesValue);
  });

  it('should not override non-empty field value with default country', () => {
    const fieldDefinition = {
      ...basePhonesFieldDefinition,
      metadata: {
        fieldName: 'phones',
        settings: { defaultCountryCode: 'CZ' },
      },
    };

    const nonEmptyValue = {
      primaryPhoneNumber: '123456789',
      primaryPhoneCountryCode: 'DE',
      primaryPhoneCallingCode: '+49',
      additionalPhones: null,
    };

    const result = computeDraftValueFromFieldValue({
      fieldDefinition,
      fieldValue: nonEmptyValue,
    });

    expect(result).toEqual(nonEmptyValue);
  });
});
