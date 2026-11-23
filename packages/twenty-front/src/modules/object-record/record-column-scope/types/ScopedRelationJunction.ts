import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ValidResolvedJunctionConfig } from '@/object-record/record-field/ui/utils/junction/types/ValidResolvedJunctionConfig';

export type ScopedRelationJunction = {
  junctionConfig: ValidResolvedJunctionConfig;
  targetFieldMetadataItem: FieldMetadataItem;
  targetObjectMetadataItem: EnrichedObjectMetadataItem;
};
