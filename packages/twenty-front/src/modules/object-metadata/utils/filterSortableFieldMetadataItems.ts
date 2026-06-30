import { SORTABLE_FIELD_METADATA_TYPES } from '@/object-metadata/constants/SortableFieldMetadataTypes';
import { isHiddenSystemField } from '@/object-metadata/utils/isHiddenSystemField';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import {
  type FieldMetadataType,
  type RelationType,
} from '~/generated-metadata/graphql';

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

  return (
    !isHiddenSystemField(field) &&
    isFieldActive &&
    (isFieldTypeSortable || isManyToOneRelationField(field))
  );
};
