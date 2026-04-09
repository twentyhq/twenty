import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { FieldMetadataType } from 'twenty-shared/types';

export const hasObjectMetadataItemFieldCreatedBy = (
  objectMetadataItem: EnrichedObjectMetadataItem,
) =>
  objectMetadataItem.fields.some(
    (field) =>
      field.type === FieldMetadataType.ACTOR && field.name === 'createdBy',
  );
