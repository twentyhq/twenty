import { FieldMetadataType } from '~/generated-metadata/graphql';
import {
  mockedCompanyObjectMetadataItem,
  mockedCustomObjectMetadataItem,
} from '~/testing/mock-data/metadata';

import { getSelectFieldPreviewValue } from '../getSelectFieldPreviewValue';

describe('getSelectFieldPreviewValue', () => {
  it('returns null if the field is not a Select field', () => {
    // Given
    const fieldMetadataItem = mockedCompanyObjectMetadataItem.fields.find(
      ({ type }) => type !== FieldMetadataType.Select,
    );

    if (!fieldMetadataItem) {
      throw new Error('Field not found');
    }

    // When
    const previewValue = getSelectFieldPreviewValue({ fieldMetadataItem });

    // Then
    expect(previewValue).toBeNull();
  });

  const fieldName = 'priority';
  const fieldMetadataItem = mockedCustomObjectMetadataItem.fields.find(
    ({ name, type }) => name === fieldName && type === FieldMetadataType.Select,
  );

  if (!fieldMetadataItem) {
    throw new Error(`Field '${fieldName}' not found`);
  }

  it("returns the defaultValue as an option value if a valid defaultValue is found in the field's metadata", () => {
    // Given
    const defaultValue = "'MEDIUM'";
    const fieldMetadataItemWithDefaultValue = {
      ...fieldMetadataItem,
      defaultValue,
    };

    // When
    const previewValue = getSelectFieldPreviewValue({
      fieldMetadataItem: fieldMetadataItemWithDefaultValue,
    });

    // Then
    expect(previewValue).toBe('MEDIUM');
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
    expect(previewValue).toBe('LOW');
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
    expect(previewValue).toBe('LOW');
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
