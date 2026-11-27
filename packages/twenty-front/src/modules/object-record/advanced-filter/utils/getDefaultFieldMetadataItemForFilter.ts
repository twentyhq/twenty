import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

export const getDefaultFieldMetadataItemForFilter = <
  TFieldMetadataItem extends Pick<FieldMetadataItem, 'id'>,
>({
  objectMetadataItem,
  filterableFieldMetadataItems,
}: {
  objectMetadataItem: Pick<
    EnrichedObjectMetadataItem,
    'labelIdentifierFieldMetadataId'
  >;
  filterableFieldMetadataItems: TFieldMetadataItem[];
}): TFieldMetadataItem | undefined =>
  filterableFieldMetadataItems.find(
    ({ id }) => id === objectMetadataItem.labelIdentifierFieldMetadataId,
  ) ?? filterableFieldMetadataItems.at(0);
