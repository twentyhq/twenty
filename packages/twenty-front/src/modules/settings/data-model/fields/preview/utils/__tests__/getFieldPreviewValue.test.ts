import { getFieldPreviewValue } from '@/settings/data-model/fields/preview/utils/getFieldPreviewValue';
import { getSettingsFieldTypeConfig } from '@/settings/data-model/utils/getSettingsFieldTypeConfig';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';

const mockedCompanyObjectMetadataItem = generatedMockObjectMetadataItems.find(
  (item) => item.nameSingular === 'company',
);

const mockedPersonObjectMetadataItem = generatedMockObjectMetadataItems.find(
  (item) => item.nameSingular === 'person',
);

describe('getFieldPreviewValue', () => {
  it("returns the field's defaultValue from metadata if it exists", () => {
    // Given
    const fieldName = 'idealCustomerProfile';
    const fieldMetadataItem = mockedCompanyObjectMetadataItem?.fields.find(
      ({ name }) => name === fieldName,
    );

    if (!fieldMetadataItem) {
      throw new Error(`Field '${fieldName}' not found`);
    }

    // When
    const result = getFieldPreviewValue({ fieldMetadataItem });

    // Then
    expect(result).toBe(false);
  });

  it('returns a placeholder defaultValue if the field metadata does not have a defaultValue', () => {
    // Given
    const fieldName = 'employees';
    const fieldMetadataItem = mockedCompanyObjectMetadataItem?.fields.find(
      ({ name }) => name === fieldName,
    );

    if (!fieldMetadataItem) {
      throw new Error(`Field '${fieldName}' not found`);
    }

    // When
    const result = getFieldPreviewValue({ fieldMetadataItem });

    // Then
    expect(result).toBe(2000);
    expect(result).toBe(
      getSettingsFieldTypeConfig(FieldMetadataType.Number).exampleValue,
    );
  });

  it('returns null if the field is supported in Settings but has no pre-configured placeholder defaultValue', () => {
    // Given
    const fieldName = 'company';
    const fieldMetadataItem = mockedPersonObjectMetadataItem?.fields.find(
      ({ name }) => name === fieldName,
    );

    if (!fieldMetadataItem) {
      throw new Error(`Field '${fieldName}' not found`);
    }

    // When
    const result = getFieldPreviewValue({ fieldMetadataItem });

    // Then
    expect(result).toBeNull();
  });
});
