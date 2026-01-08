import { FieldMetadataType } from '~/generated-metadata/graphql';

import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';
import { getCurrencyFieldPreviewValue } from '@/settings/data-model/fields/preview/utils/getCurrencyFieldPreviewValue';
import { CurrencyCode } from 'twenty-shared/constants';

const mockedCompanyObjectMetadataItem = generatedMockObjectMetadataItems.find(
  (item) => item.nameSingular === 'company',
);

const mockedOpportunityObjectMetadataItem =
  generatedMockObjectMetadataItems.find(
    (item) => item.nameSingular === 'opportunity',
  );

describe('getCurrencyFieldPreviewValue', () => {
  it('returns null if the field is not a Currency field', () => {
    // Given
    const fieldMetadataItem = mockedCompanyObjectMetadataItem?.fields.find(
      ({ type }) => type !== FieldMetadataType.CURRENCY,
    );

    if (!fieldMetadataItem) {
      throw new Error('Field not found');
    }

    // When
    const previewValue = getCurrencyFieldPreviewValue({ fieldMetadataItem });

    // Then
    expect(previewValue).toBeNull();
  });

  const fieldName = 'amount';
  const fieldMetadataItem = mockedOpportunityObjectMetadataItem?.fields.find(
    ({ name, type }) =>
      name === fieldName && type === FieldMetadataType.CURRENCY,
  );

  if (!fieldMetadataItem) {
    throw new Error(`Field '${fieldName}' not found`);
  }

  it("returns the parsed defaultValue if a valid defaultValue is found in the field's metadata", () => {
    // Given
    const defaultValue = {
      amountMicros: 3000000000,
      currencyCode: `'${CurrencyCode.EUR}'`,
    };
    const fieldMetadataItemWithDefaultValue = {
      ...fieldMetadataItem,
      defaultValue,
    };

    // When
    const previewValue = getCurrencyFieldPreviewValue({
      fieldMetadataItem: fieldMetadataItemWithDefaultValue,
    });

    // Then
    expect(previewValue).toEqual({
      amountMicros: defaultValue.amountMicros,
      currencyCode: CurrencyCode.EUR,
    });
  });

  it("returns a placeholder amountMicros if it is empty in the field's metadata defaultValue", () => {
    // Given
    const defaultValue = {
      amountMicros: null,
      currencyCode: `'${CurrencyCode.EUR}'`,
    };
    const fieldMetadataItemWithDefaultValue = {
      ...fieldMetadataItem,
      defaultValue,
    };

    // When
    const previewValue = getCurrencyFieldPreviewValue({
      fieldMetadataItem: fieldMetadataItemWithDefaultValue,
    });

    // Then
    expect(previewValue).toEqual({
      amountMicros: 2000000000,
      currencyCode: CurrencyCode.EUR,
    });
  });

  it("returns a placeholder default value if the defaultValue found in the field's metadata is invalid", () => {
    // Given
    const defaultValue = {
      amountMicros: null,
      currencyCode: "''",
    };
    const fieldMetadataItemWithDefaultValue = {
      ...fieldMetadataItem,
      defaultValue,
    };

    // When
    const previewValue = getCurrencyFieldPreviewValue({
      fieldMetadataItem: fieldMetadataItemWithDefaultValue,
    });

    // Then
    expect(previewValue).toEqual({
      amountMicros: 2000000000,
      currencyCode: CurrencyCode.USD,
    });
  });

  it("returns a placeholder default value if no defaultValue is found in the field's metadata", () => {
    // Given
    const defaultValue = null;
    const fieldMetadataItemWithDefaultValue = {
      ...fieldMetadataItem,
      defaultValue,
    };

    // When
    const previewValue = getCurrencyFieldPreviewValue({
      fieldMetadataItem: fieldMetadataItemWithDefaultValue,
    });

    // Then
    expect(previewValue).toEqual({
      amountMicros: 2000000000,
      currencyCode: CurrencyCode.USD,
    });
  });
});
