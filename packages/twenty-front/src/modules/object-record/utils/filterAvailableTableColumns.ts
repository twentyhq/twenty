import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { isFieldRelation } from '@/object-record/record-field/types/guards/isFieldRelation';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { TABLE_COLUMNS_DENY_LIST } from '@/object-record/relation-picker/constants/TableColumnsDenyList';
import { RelationDefinitionType } from '~/generated-metadata/graphql';

export const filterAvailableTableColumns = (
  columnDefinition: ColumnDefinition<FieldMetadata>,
): boolean => {
  if (
    isFieldRelation(columnDefinition) &&
    columnDefinition.metadata?.relationType ===
      RelationDefinitionType.ManyToMany
  ) {
    return false;
  }

  if (TABLE_COLUMNS_DENY_LIST.includes(columnDefinition.metadata.fieldName)) {
    return false;
  }

  if (columnDefinition.type === 'UUID') {
    return false;
  }

  return true;
};
