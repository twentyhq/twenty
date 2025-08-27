import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const isAggregationEnabled = (objectMetadataItem: ObjectMetadataItem) =>
  !objectMetadataItem.isRemote;
