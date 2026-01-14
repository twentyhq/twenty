import { SORTABLE_FIELD_METADATA_TYPES } from '@/object-metadata/constants/SortableFieldMetadataTypes';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

type SortableFieldInput = {
  isSystem?: boolean | null;
  isActive?: boolean | null;
  type: FieldMetadataType;
  relation?: { type: RelationType } | null;
};

export const filterSortableFieldMetadataItems = (field: SortableFieldInput) => {
  const isSystemField = field.isSystem;
  const isFieldActive = field.isActive;

  const isFieldTypeSortable = SORTABLE_FIELD_METADATA_TYPES.includes(
    field.type,
  );

  const isRelationFieldSortable =
    field.type === FieldMetadataType.RELATION &&
    field.relation?.type === RelationType.MANY_TO_ONE;

  return (
    !isSystemField &&
    isFieldActive &&
    (isFieldTypeSortable || isRelationFieldSortable)
  );
};
