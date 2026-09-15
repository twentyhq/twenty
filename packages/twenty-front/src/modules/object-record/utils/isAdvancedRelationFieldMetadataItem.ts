import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isFieldCellSupported } from '@/object-record/utils/isFieldCellSupported';

export const isAdvancedRelationFieldMetadataItem = (
  fieldMetadataItem: FieldMetadataItem,
  objectMetadataItems: EnrichedObjectMetadataItem[],
) =>
  !isFieldCellSupported(fieldMetadataItem, objectMetadataItems) &&
  isFieldCellSupported(fieldMetadataItem, objectMetadataItems, {
    includeSystemObjectRelations: true,
  });
