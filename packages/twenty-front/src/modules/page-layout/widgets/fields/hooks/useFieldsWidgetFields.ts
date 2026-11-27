import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

export const useFieldsWidgetFields = (
  objectMetadataItem: EnrichedObjectMetadataItem | undefined,
): FieldMetadataItem[] => objectMetadataItem?.readableFields ?? [];
