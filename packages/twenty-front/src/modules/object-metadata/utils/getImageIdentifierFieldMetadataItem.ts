import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

export const getImageIdentifierFieldMetadataItem = (
  objectMetadataItem: Pick<
    EnrichedObjectMetadataItem,
    'fields' | 'imageIdentifierFieldMetadataId'
  >,
): FieldMetadataItem | undefined =>
  objectMetadataItem.fields.find(
    (fieldMetadataItem) =>
      fieldMetadataItem.id ===
      objectMetadataItem.imageIdentifierFieldMetadataId,
  );
