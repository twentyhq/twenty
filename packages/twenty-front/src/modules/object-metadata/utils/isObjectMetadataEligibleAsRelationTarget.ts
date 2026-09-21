import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

// Whether an object can be picked as the destination when creating a relation,
// mirroring the server rule (field creation only rejects remote parent objects).
// Distinct from isObjectMetadataAvailableForRelation, which answers whether a
// relation cell targeting the object renders in record UIs by default.
export const isObjectMetadataEligibleAsRelationTarget = (
  objectMetadataItem: Pick<EnrichedObjectMetadataItem, 'isRemote'>,
) => !objectMetadataItem.isRemote;
