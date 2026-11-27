import { type ScopedRelationJunction } from '@/object-record/record-column-scope/types/ScopedRelationJunction';

export type ScopedRelationJunctionTargetField = {
  targetFieldMetadataItem: Pick<
    ScopedRelationJunction['targetFieldMetadataItem'],
    'id'
  >;
};
