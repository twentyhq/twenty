import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

export type RelatedRecordsWidgetSource = {
  fieldMetadataItem: FieldMetadataItem;
  targetObjectMetadataItem: EnrichedObjectMetadataItem;
  inverseFieldMetadataId: string;
  relationTargetFieldMetadataId: string | null;
  defaultGroupByFieldMetadataItem: FieldMetadataItem | null;
  defaultCalendarFieldMetadataItem: FieldMetadataItem | null;
};
