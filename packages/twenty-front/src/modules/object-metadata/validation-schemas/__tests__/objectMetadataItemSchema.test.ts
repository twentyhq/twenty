import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';
import { objectMetadataItemSchema } from '@/object-metadata/validation-schemas/objectMetadataItemSchema';

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

  it('fails for an invalid object metadata item that has null labelIdentifier', () => {
    // Given
    const validObjectMetadataItem = generatedMockObjectMetadataItems.find(
      (item) => item.nameSingular === 'company',
    );
    expect(validObjectMetadataItem).not.toBeUndefined();
    if (validObjectMetadataItem === undefined)
      throw new Error('Should never occur');

    // When
    const result = objectMetadataItemSchema.safeParse({
      ...validObjectMetadataItem,
      labelIdentifierFieldMetadataId: null,
    });

    // Then
    expect(result.success).toEqual(false);
  });

  it('fails for an invalid object metadata item', () => {
    // Given
    const invalidObjectMetadataItem: Partial<
      Record<keyof ObjectMetadataItem, unknown>
    > = {
      createdAt: 'invalid date',
      fields: 'not an array',
      icon: 'invalid icon',
      isActive: 'not a boolean',
      isCustom: 'not a boolean',
      isSystem: 'not a boolean',
      labelIdentifierFieldMetadataId: 'not a uuid',
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

  it('should fail to parse empty string as LabelIdentifier', () => {
    const emptyString = '';
    const result =
      objectMetadataItemSchema.shape.labelIdentifierFieldMetadataId.safeParse(
        emptyString,
      );
    expect(result.success).toBe(false);
  });

  it('should succeed to parse valid uuid as LabelIdentifier', () => {
    const validUuid = '20202020-ae24-4871-b445-10cc8872cb10';
    const result =
      objectMetadataItemSchema.shape.labelIdentifierFieldMetadataId.safeParse(
        validUuid,
      );
    expect(result.success).toBe(true);
  });
});
