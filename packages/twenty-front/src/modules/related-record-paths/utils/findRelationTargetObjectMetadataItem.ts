import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

export const findRelationTargetObjectMetadataItem = ({
  fieldMetadataItem,
  objectMetadataItems,
}: {
  fieldMetadataItem: Pick<FieldMetadataItem, 'relation'>;
  objectMetadataItems: EnrichedObjectMetadataItem[];
}): EnrichedObjectMetadataItem | undefined =>
  objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.id ===
      fieldMetadataItem.relation?.targetObjectMetadata.id,
  );
