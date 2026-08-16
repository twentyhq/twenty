// SOURCING: none — pure logic, no upstream component applies
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { FieldMetadataType } from 'twenty-shared/types';

export const getObjectRelationFields = (
  objectMetadataItem: Pick<EnrichedObjectMetadataItem, 'fields'>,
): FieldMetadataItem[] =>
  objectMetadataItem.fields.filter(
    (field) =>
      field.type === FieldMetadataType.RELATION &&
      field.isActive !== false &&
      field.isSystem !== true,
  );
