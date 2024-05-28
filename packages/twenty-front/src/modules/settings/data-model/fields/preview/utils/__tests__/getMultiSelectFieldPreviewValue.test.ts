import { FieldMetadataType } from '~/generated-metadata/graphql';
import {
  mockedCompanyObjectMetadataItem,
  mockedCustomObjectMetadataItem,
} from '~/testing/mock-data/metadata';

import { getMultiSelectFieldPreviewValue } from '../getMultiSelectFieldPreviewValue';

describe('getMultiSelectFieldPreviewValue', () => {
  it('returns null if the field is not a Multi-Select field', () => {
    // Given
    const fieldMetadataItem = mockedCompanyObjectMetadataItem.fields.find(
      ({ type }) => type !== FieldMetadataType.MultiSelect,
    );

    if (!fieldMetadataItem) {
      throw new Error('Field not found');
    }

    // When
    const previewValue = getMultiSelectFieldPreviewValue({ fieldMetadataItem });

    // Then
    expect(previewValue).toBeNull();
  });

  const fieldName = 'priority';
  const selectFieldMetadataItem = mockedCustomObjectMetadataItem.fields.find(
    ({ name, type }) => name === fieldName && type === FieldMetadataType.Select,
  );

  if (!selectFieldMetadataItem) {
    throw new Error(`Field '${fieldName}' not found`);
  }

  const fieldMetadataItem = {
    ...selectFieldMetadataItem,
    type: FieldMetadataType.MultiSelect,
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
    expect(previewValue).toEqual(['MEDIUM', 'LOW']);
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
    expect(previewValue).toEqual(['LOW', 'MEDIUM', 'HIGH']);
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
    expect(previewValue).toEqual(['LOW', 'MEDIUM', 'HIGH']);
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
