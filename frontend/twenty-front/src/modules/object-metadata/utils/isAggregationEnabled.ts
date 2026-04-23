import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

export const isAggregationEnabled = (
  objectMetadataItem: EnrichedObjectMetadataItem,
) => !objectMetadataItem.isRemote;
