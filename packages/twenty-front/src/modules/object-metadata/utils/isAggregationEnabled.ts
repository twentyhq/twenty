import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const isAggregationEnabled = (
  objectMetadataItem: ObjectMetadataItem,
) => {
  return !objectMetadataItem.isRemote;
};
