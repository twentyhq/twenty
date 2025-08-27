import { SORTABLE_FIELD_METADATA_TYPES } from '@/object-metadata/constants/SortableFieldMetadataTypes';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

export const filterSortableFieldMetadataItems = (field: FieldMetadataItem) => {
  const isSystemField = field.isSystem;
  const isFieldActive = field.isActive;

  const isFieldTypeSortable = SORTABLE_FIELD_METADATA_TYPES.includes(
    field.type,
  );

  return !isSystemField && isFieldActive && isFieldTypeSortable;
};
