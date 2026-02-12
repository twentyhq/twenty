import {
  booleanFieldDefinition,
  fieldMetadataId,
  fullNameFieldDefinition,
  linksFieldDefinition,
  morphRelationFieldDefinition,
  relationFieldDefinition,
  selectFieldDefinition,
} from '@/object-record/record-field/ui/__mocks__/fieldDefinitions';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldCurrencyMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { isFieldValueEmpty } from '@/object-record/record-field/ui/utils/isFieldValueEmpty';

describe('isFieldValueEmpty', () => {
  it('should return correct value for boolean field', () => {
    expect(
      isFieldValueEmpty({
        fieldDefinition: booleanFieldDefinition,
        fieldValue: null,
      }),
    ).toBe(true);
    expect(
      isFieldValueEmpty({
        fieldDefinition: booleanFieldDefinition,
        fieldValue: false,
      }),
    ).toBe(false);
    expect(
      isFieldValueEmpty({
        fieldDefinition: booleanFieldDefinition,
        fieldValue: true,
      }),
    ).toBe(false);
  });

  it('should return correct value for relation field', () => {
    expect(
      isFieldValueEmpty({
        fieldDefinition: relationFieldDefinition,
        fieldValue: null,
      }),
    ).toBe(true);
    expect(
      isFieldValueEmpty({
        fieldDefinition: relationFieldDefinition,
        fieldValue: { foo: 'bar' },
      }),
    ).toBe(false);
    expect(
      isFieldValueEmpty({
        fieldDefinition: relationFieldDefinition,
        fieldValue: [],
      }),
    ).toBe(true);
    expect(
      isFieldValueEmpty({
        fieldDefinition: relationFieldDefinition,
        fieldValue: [{ id: '123' }],
      }),
    ).toBe(false);
  });

  it('should return correct value for select field', () => {
    // If the value does not match the fieldDefinition, it will always return `false`
    // Should it return `false` or `true` if the fieldValue doesn't match?
    expect(
      isFieldValueEmpty({
        fieldDefinition: selectFieldDefinition,
        fieldValue: '',
      }),
    ).toBe(false);
  });

  it('should return correct value for currency field', () => {
    const fieldDefinition: FieldDefinition<FieldCurrencyMetadata> = {
      fieldMetadataId,
      label: 'Annual Income',
      iconName: 'cashCow',
      type: FieldMetadataType.CURRENCY,
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
    expect(
      isFieldValueEmpty({
        fieldDefinition: fullNameFieldDefinition,
        fieldValue: { firstName: '', lastName: '' },
      }),
    ).toBe(true);
    expect(
      isFieldValueEmpty({
        fieldDefinition: fullNameFieldDefinition,
        fieldValue: { firstName: 'Sheldon', lastName: '' },
      }),
    ).toBe(false);
  });

  it('should return correct value for links field', () => {
    // Empty cases
    expect(
      isFieldValueEmpty({
        fieldDefinition: linksFieldDefinition,
        fieldValue: {
          primaryLinkUrl: null,
          primaryLinkLabel: null,
          secondaryLinks: [],
        },
      }),
    ).toBe(true);

    expect(
      isFieldValueEmpty({
        fieldDefinition: linksFieldDefinition,
        fieldValue: null,
      }),
    ).toBe(true);

    // Valid primary link only
    expect(
      isFieldValueEmpty({
        fieldDefinition: linksFieldDefinition,
        fieldValue: {
          primaryLinkUrl: 'https://www.twenty.com',
          primaryLinkLabel: 'Twenty Website',
          secondaryLinks: [],
        },
      }),
    ).toBe(false);

    // Valid secondary link only
    expect(
      isFieldValueEmpty({
        fieldDefinition: linksFieldDefinition,
        fieldValue: {
          primaryLinkUrl: null,
          primaryLinkLabel: null,
          secondaryLinks: [
            { url: 'https://docs.twenty.com', label: 'Documentation' },
          ],
        },
      }),
    ).toBe(false);

    // Invalid primary link but valid secondary link
    expect(
      isFieldValueEmpty({
        fieldDefinition: linksFieldDefinition,
        fieldValue: {
          primaryLinkUrl: 'lydia,com',
          primaryLinkLabel: 'Invalid URL',
          secondaryLinks: [
            { url: 'https://docs.twenty.com', label: 'Documentation' },
          ],
        },
      }),
    ).toBe(false);

    // Valid primary link but invalid secondary link
    expect(
      isFieldValueEmpty({
        fieldDefinition: linksFieldDefinition,
        fieldValue: {
          primaryLinkUrl: 'https://www.twenty.com',
          primaryLinkLabel: 'Twenty Website',
          secondaryLinks: [{ url: 'wikipedia', label: 'Invalid URL' }],
        },
      }),
    ).toBe(false);

    // All invalid links
    expect(
      isFieldValueEmpty({
        fieldDefinition: linksFieldDefinition,
        fieldValue: {
          primaryLinkUrl: 'lydia,com',
          primaryLinkLabel: 'Invalid URL',
          secondaryLinks: [{ url: 'wikipedia', label: 'Invalid URL' }],
        },
      }),
    ).toBe(true);

    // Multiple secondary links with mix of valid and invalid
    expect(
      isFieldValueEmpty({
        fieldDefinition: linksFieldDefinition,
        fieldValue: {
          primaryLinkUrl: null,
          primaryLinkLabel: null,
          secondaryLinks: [
            { url: 'wikipedia', label: 'Invalid URL' },
            { url: 'https://docs.twenty.com', label: 'Documentation' },
          ],
        },
      }),
    ).toBe(false);
  });

  it('should return correct value for morph relation field', () => {
    expect(
      isFieldValueEmpty({
        fieldDefinition: morphRelationFieldDefinition,
        fieldValue: null,
      }),
    ).toBe(true);
    expect(
      isFieldValueEmpty({
        fieldDefinition: morphRelationFieldDefinition,
        fieldValue: [{ value: null }, { value: [] }],
      }),
    ).toBe(true);
    expect(
      isFieldValueEmpty({
        fieldDefinition: morphRelationFieldDefinition,
        fieldValue: [{ value: [{ id: '123' }] }],
      }),
    ).toBe(false);
  });
});
