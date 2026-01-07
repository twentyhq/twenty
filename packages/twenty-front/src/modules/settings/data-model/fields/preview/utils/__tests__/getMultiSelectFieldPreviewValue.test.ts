import { FieldMetadataType } from '~/generated-metadata/graphql';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';
import { getMultiSelectFieldPreviewValue } from '@/settings/data-model/fields/preview/utils/getMultiSelectFieldPreviewValue';

const mockedCompanyObjectMetadataItem = generatedMockObjectMetadataItems.find(
  (item) => item.nameSingular === 'company',
);

const mockedOpportunityObjectMetadataItem =
  generatedMockObjectMetadataItems.find(
    (item) => item.nameSingular === 'opportunity',
  );

describe('getMultiSelectFieldPreviewValue', () => {
  it('returns null if the field is not a Multi-Select field', () => {
    // Given
    const fieldMetadataItem = mockedCompanyObjectMetadataItem?.fields.find(
      ({ type }) => type !== FieldMetadataType.MULTI_SELECT,
    );

    if (!fieldMetadataItem) {
      throw new Error('Field not found');
    }

    // When
    const previewValue = getMultiSelectFieldPreviewValue({ fieldMetadataItem });

    // Then
    expect(previewValue).toBeNull();
  });

  const fieldName = 'stage';
  const selectFieldMetadataItem =
    mockedOpportunityObjectMetadataItem?.fields.find(
      ({ name }) => name === fieldName,
    );

  if (!selectFieldMetadataItem) {
    throw new Error(`Field '${fieldName}' not found`);
  }

  const fieldMetadataItem = {
    ...selectFieldMetadataItem,
    type: FieldMetadataType.MULTI_SELECT,
  };

  it("returns the defaultValue as an option value if a valid defaultValue is found in the field's metadata", () => {
    // Given
    const defaultValue = ["'MEDIUM'", "'LOW'"];
    const fieldMetadataItemWithDefaultValue = {
      ...fieldMetadataItem,
      defaultValue,
    };

    // When
    const previewValue = getMultiSelectFieldPreviewValue({
      fieldMetadataItem: fieldMetadataItemWithDefaultValue,
    });

    // Then
    expect(previewValue).toEqual([
      'NEW',
      'SCREENING',
      'MEETING',
      'PROPOSAL',
      'CUSTOMER',
    ]);
  });

  it("returns all option values if no defaultValue was found in the field's metadata", () => {
    // Given
    const defaultValue = null;
    const fieldMetadataItemWithDefaultValue = {
      ...fieldMetadataItem,
      defaultValue,
    };

    // When
    const previewValue = getMultiSelectFieldPreviewValue({
      fieldMetadataItem: fieldMetadataItemWithDefaultValue,
    });

    // Then
    expect(previewValue).toEqual([
      'NEW',
      'SCREENING',
      'MEETING',
      'PROPOSAL',
      'CUSTOMER',
    ]);
    expect(previewValue).toEqual(
      fieldMetadataItemWithDefaultValue.options?.map(({ value }) => value),
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
    const previewValue = getMultiSelectFieldPreviewValue({
      fieldMetadataItem: fieldMetadataItemWithDefaultValue,
    });

    // Then
    expect(previewValue).toEqual([
      'NEW',
      'SCREENING',
      'MEETING',
      'PROPOSAL',
      'CUSTOMER',
    ]);
    expect(previewValue).toEqual(
      fieldMetadataItemWithDefaultValue.options?.map(({ value }) => value),
    );
  });

  it('returns null if options are not defined', () => {
    // Given
    const fieldMetadataItemWithNoOptions = {
      ...fieldMetadataItem,
      options: undefined,
    };

    // When
    const previewValue = getMultiSelectFieldPreviewValue({
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
    const previewValue = getMultiSelectFieldPreviewValue({
      fieldMetadataItem: fieldMetadataItemWithEmptyOptions,
    });

    // Then
    expect(previewValue).toBeNull();
  });
});
