import { FieldMetadataType } from '~/generated-metadata/graphql';

import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';
import { getSelectFieldPreviewValue } from '@/settings/data-model/fields/preview/utils/getSelectFieldPreviewValue';

const mockedCompanyObjectMetadataItem = generatedMockObjectMetadataItems.find(
  (item) => item.nameSingular === 'company',
);

const mockedOpportunityObjectMetadataItem =
  generatedMockObjectMetadataItems.find(
    (item) => item.nameSingular === 'opportunity',
  );

describe('getSelectFieldPreviewValue', () => {
  it('returns null if the field is not a Select field', () => {
    // Given
    const fieldMetadataItem = mockedCompanyObjectMetadataItem?.fields.find(
      ({ type }) => type !== FieldMetadataType.SELECT,
    );

    if (!fieldMetadataItem) {
      throw new Error('Field not found');
    }

    // When
    const previewValue = getSelectFieldPreviewValue({ fieldMetadataItem });

    // Then
    expect(previewValue).toBeNull();
  });

  const fieldName = 'stage';
  const fieldMetadataItem = mockedOpportunityObjectMetadataItem?.fields.find(
    ({ name }) => name === fieldName,
  );

  if (!fieldMetadataItem) {
    throw new Error(`Field '${fieldName}' not found`);
  }

  it("returns the defaultValue as an option value if a valid defaultValue is found in the field's metadata", () => {
    // Given
    const defaultValue = "'NEW'";
    const fieldMetadataItemWithDefaultValue = {
      ...fieldMetadataItem,
      defaultValue,
    };

    // When
    const previewValue = getSelectFieldPreviewValue({
      fieldMetadataItem: fieldMetadataItemWithDefaultValue,
    });

    // Then
    expect(previewValue).toBe('NEW');
  });

  it("returns the first option value if no defaultValue was found in the field's metadata", () => {
    // Given
    const defaultValue = null;
    const fieldMetadataItemWithDefaultValue = {
      ...fieldMetadataItem,
      defaultValue,
    };

    // When
    const previewValue = getSelectFieldPreviewValue({
      fieldMetadataItem: fieldMetadataItemWithDefaultValue,
    });

    // Then
    expect(previewValue).toBe('NEW');
    expect(previewValue).toBe(
      fieldMetadataItemWithDefaultValue.options?.[0]?.value,
    );
  });

  it("returns the first option value if the defaultValue found in the field's metadata is invalid", () => {
    // Given
    const defaultValue = false;
    const fieldMetadataItemWithDefaultValue = {
      ...fieldMetadataItem,
      defaultValue,
    };

    // When
    const previewValue = getSelectFieldPreviewValue({
      fieldMetadataItem: fieldMetadataItemWithDefaultValue,
    });

    // Then
    expect(previewValue).toBe('NEW');
    expect(previewValue).toBe(
      fieldMetadataItemWithDefaultValue.options?.[0]?.value,
    );
  });

  it('returns null if options are not defined', () => {
    // Given
    const fieldMetadataItemWithNoOptions = {
      ...fieldMetadataItem,
      options: undefined,
    };

    // When
    const previewValue = getSelectFieldPreviewValue({
      fieldMetadataItem: fieldMetadataItemWithNoOptions,
    });

    // Then
    expect(previewValue).toBeNull();
  });

  it('returns null if options array is empty', () => {
    // Given
    const fieldMetadataItemWithEmptyOptions = {
      ...fieldMetadataItem,
      options: [],
    };

    // When
    const previewValue = getSelectFieldPreviewValue({
      fieldMetadataItem: fieldMetadataItemWithEmptyOptions,
    });

    // Then
    expect(previewValue).toBeNull();
  });
});
