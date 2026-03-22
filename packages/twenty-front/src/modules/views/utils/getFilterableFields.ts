import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getFilterFilterableFieldMetadataItems } from '@/object-metadata/utils/getFilterFilterableFieldMetadataItems';

export const getFilterableFields = (
  objectMetadataItem: EnrichedObjectMetadataItem,
) => {
  return [
    ...objectMetadataItem.fields.filter(
      getFilterFilterableFieldMetadataItems({ isJsonFilterEnabled: true }),
    ),
  ];
};
