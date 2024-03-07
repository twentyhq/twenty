import { SafeParseSuccess } from 'zod';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { mockedCompanyObjectMetadataItem } from '@/object-record/record-field/__mocks__/fieldDefinitions';

import { objectMetadataItemSchema } from '../objectMetadataItemSchema';

describe('objectMetadataItemSchema', () => {
  it('validates a valid object metadata item', () => {
    // Given
    const validObjectMetadataItem = mockedCompanyObjectMetadataItem;

    // When
    const result = objectMetadataItemSchema.safeParse(validObjectMetadataItem);

    // Then
    expect(result.success).toBe(true);
    expect((result as SafeParseSuccess<ObjectMetadataItem>).data).toEqual(
      validObjectMetadataItem,
    );
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
    };

    // When
    const result = objectMetadataItemSchema.safeParse(
      invalidObjectMetadataItem,
    );

    // Then
    expect(result.success).toBe(false);
  });
});
