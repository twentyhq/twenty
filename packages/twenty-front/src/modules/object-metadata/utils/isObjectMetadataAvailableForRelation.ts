import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

export const isObjectMetadataAvailableForRelation = (
  objectMetadataItem: Pick<EnrichedObjectMetadataItem, 'isRemote'>,
) => !objectMetadataItem.isRemote;
