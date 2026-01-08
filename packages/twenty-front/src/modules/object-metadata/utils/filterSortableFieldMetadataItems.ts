import { SORTABLE_FIELD_METADATA_TYPES } from '@/object-metadata/constants/SortableFieldMetadataTypes';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

export const filterSortableFieldMetadataItems = (field: FieldMetadataItem) => {
  const isSystemField = field.isSystem;
  const isFieldActive = field.isActive;

  const isFieldTypeSortable = SORTABLE_FIELD_METADATA_TYPES.includes(
    field.type,
  );

  // Allow MANY_TO_ONE relations to be sorted (sorts by related object's label identifier)
  const isRelationFieldSortable =
    field.type === FieldMetadataType.RELATION &&
    field.relation?.type === RelationType.MANY_TO_ONE;

  return (
    !isSystemField &&
    isFieldActive &&
    (isFieldTypeSortable || isRelationFieldSortable)
  );
};
