import { FieldDefinition } from '@/object-record/field/types/FieldDefinition';
import {
  FieldBooleanMetadata,
  FieldCurrencyMetadata,
  FieldFullNameMetadata,
  FieldLinkMetadata,
  FieldRelationMetadata,
  FieldSelectMetadata,
} from '@/object-record/field/types/FieldMetadata';

import { isFieldValueEmpty } from '../isFieldValueEmpty';

const fieldMetadataId = 'fieldMetadataId';

describe('isFieldValueEmpty', () => {
  it('should return correct value for boolean field', () => {
    const fieldDefinition: FieldDefinition<FieldBooleanMetadata> = {
      fieldMetadataId,
      label: 'Is Active?',
      iconName: 'iconName',
      type: 'BOOLEAN',
      metadata: {
        objectMetadataNameSingular: 'person',
        fieldName: 'isActive',
      },
    };

    expect(isFieldValueEmpty({ fieldDefinition, fieldValue: null })).toBe(true);
    expect(isFieldValueEmpty({ fieldDefinition, fieldValue: false })).toBe(
      false,
    );
    expect(isFieldValueEmpty({ fieldDefinition, fieldValue: true })).toBe(
      false,
    );
  });

  it('should return correct value for relation field', () => {
    const fieldDefinition: FieldDefinition<FieldRelationMetadata> = {
      fieldMetadataId,
      label: 'Contact',
      iconName: 'Phone',
      type: 'RELATION',
      metadata: {
        fieldName: 'contact',
        relationFieldMetadataId: 'relationFieldMetadataId',
        relationObjectMetadataNamePlural: 'users',
        relationObjectMetadataNameSingular: 'user',
      },
    };

    expect(isFieldValueEmpty({ fieldDefinition, fieldValue: null })).toBe(true);
    expect(
      isFieldValueEmpty({ fieldDefinition, fieldValue: { foo: 'bar' } }),
    ).toBe(false);
  });

  it('should return correct value for select field', () => {
    const fieldDefinition: FieldDefinition<FieldSelectMetadata> = {
      fieldMetadataId,
      label: 'Account Owner',
      iconName: 'iconName',
      type: 'SELECT',
      metadata: {
        fieldName: 'accountOwner',
        options: [{ label: 'Elon Musk', color: 'blue', value: 'userId' }],
      },
    };

    // If the value does not match the fieldDefinition, it will always return `false`
    // Should it return `false` or `true` if the fieldValue doesn't match?
    expect(isFieldValueEmpty({ fieldDefinition, fieldValue: '' })).toBe(false);
  });

  it('should return correct value for currency field', () => {
    const fieldDefinition: FieldDefinition<FieldCurrencyMetadata> = {
      fieldMetadataId,
      label: 'Annual Income',
      iconName: 'cashCow',
      type: 'CURRENCY',
      metadata: {
        fieldName: 'annualIncome',
        placeHolder: '100000',
        isPositive: true,
      },
    };

    expect(
      isFieldValueEmpty({
        fieldDefinition,
        fieldValue: { currencyCode: 'USD', amountMicros: 1000000 },
      }),
    ).toBe(false);
    expect(
      isFieldValueEmpty({
        fieldDefinition,
        fieldValue: { currencyCode: 'USD' },
      }),
    ).toBe(true);
  });

  it('should return correct value for fullname field', () => {
    const fieldDefinition: FieldDefinition<FieldFullNameMetadata> = {
      fieldMetadataId,
      label: 'Display Name',
      iconName: 'profile',
      type: 'FULL_NAME',
      metadata: {
        fieldName: 'displayName',
        placeHolder: 'Mr Miagi',
      },
    };

    expect(
      isFieldValueEmpty({
        fieldDefinition,
        fieldValue: { firstName: '', lastName: '' },
      }),
    ).toBe(true);
    expect(
      isFieldValueEmpty({
        fieldDefinition,
        fieldValue: { firstName: 'Sheldon', lastName: '' },
      }),
    ).toBe(false);
  });

  it('should return correct value for link field', () => {
    const fieldDefinition: FieldDefinition<FieldLinkMetadata> = {
      fieldMetadataId,
      label: 'LinkedIn URL',
      iconName: 'url',
      type: 'LINK',
      metadata: {
        fieldName: 'linkedInURL',
        placeHolder: 'https://linkedin.com/user',
      },
    };

    expect(
      isFieldValueEmpty({
        fieldDefinition,
        fieldValue: { url: '', label: '' },
      }),
    ).toBe(true);
    expect(
      isFieldValueEmpty({
        fieldDefinition,
        fieldValue: { url: 'https://linkedin.com/user-slug', label: '' },
      }),
    ).toBe(false);
  });
});
