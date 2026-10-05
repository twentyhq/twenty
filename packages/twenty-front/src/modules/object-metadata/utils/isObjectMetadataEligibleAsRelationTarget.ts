import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

// Mirrors the server rule; distinct from isObjectMetadataAvailableForRelation (relation cell rendering).
export const isObjectMetadataEligibleAsRelationTarget = (
  objectMetadataItem: Pick<EnrichedObjectMetadataItem, 'isRemote'>,
) => !objectMetadataItem.isRemote;
