import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

export type RelatedRecordPathStep = {
  fieldMetadataItem: FieldMetadataItem;
  targetObjectMetadataItem: EnrichedObjectMetadataItem;
};
