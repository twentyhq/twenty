import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getFilterFilterableFieldMetadataItems } from '@/object-metadata/utils/getFilterFilterableFieldMetadataItems';

export const getFilterableFields = (objectMetadataItem: ObjectMetadataItem) => {
  return [
    ...objectMetadataItem.fields.filter(
      getFilterFilterableFieldMetadataItems({ isJsonFilterEnabled: true }),
    ),
  ];
};
