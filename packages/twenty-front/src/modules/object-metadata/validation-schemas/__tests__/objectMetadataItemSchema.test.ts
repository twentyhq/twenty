import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';
import { objectMetadataItemSchema } from '../objectMetadataItemSchema';

describe('objectMetadataItemSchema', () => {
  it('validates a valid object metadata item', () => {
    // Given
    const validObjectMetadataItem = generatedMockObjectMetadataItems.find(
      (item) => item.nameSingular === 'company',
    );

    // When
    const result = objectMetadataItemSchema.parse(validObjectMetadataItem);

    // Then
    expect(result).toEqual(validObjectMetadataItem);
  });

  it('fails for an invalid object metadata item', () => {
    // Given
    const invalidObjectMetadataItem = {
      createdAt: 'invalid date',
      dataSourceId: 'invalid uuid',
      fields: 'not an array',
      icon: 'invalid icon',
      isActive: 'not a boolean',
      isCustom: 'not a boolean',
      isSystem: 'not a boolean',
      labelPlural: 123,
      labelSingular: 123,
      namePlural: 'notCamelCase',
      nameSingular: 'notCamelCase',
      updatedAt: 'invalid date',
      isLabelSyncedWithName: 'not a boolean',
    };

    // When
    const result = objectMetadataItemSchema.safeParse(
      invalidObjectMetadataItem,
    );

    // Then
    expect(result.success).toBe(false);
  });
});
