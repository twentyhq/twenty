import { SORTABLE_FIELD_METADATA_TYPES } from '@/object-metadata/constants/SortableFieldMetadataTypes';
import { isHiddenSystemField } from '@/object-metadata/utils/isHiddenSystemField';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

type SortableFieldInput = {
  isSystem?: boolean | null;
  isActive?: boolean | null;
  name: string;
  type: FieldMetadataType;
  relation?: { type: RelationType } | null;
};

export const filterSortableFieldMetadataItems = (field: SortableFieldInput) => {
  const isFieldActive = field.isActive;

  const isFieldTypeSortable = SORTABLE_FIELD_METADATA_TYPES.includes(
    field.type,
  );

  const isRelationFieldSortable =
    field.type === FieldMetadataType.RELATION &&
    field.relation?.type === RelationType.MANY_TO_ONE;

  return (
    !isHiddenSystemField(field) &&
    isFieldActive &&
    (isFieldTypeSortable || isRelationFieldSortable)
  );
};
