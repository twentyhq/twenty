import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { TABLE_COLUMNS_DENY_LIST } from '@/object-record/relation-picker/constants/TableColumnsDenyList';

export const filterAvailableTableColumns = (
  columnDefinition: ColumnDefinition<FieldMetadata>,
): boolean => {
  // Removed the ManyToMany check since it's no longer needed
  if (TABLE_COLUMNS_DENY_LIST.includes(columnDefinition.metadata.fieldName)) {
    return false;
  }

  if (columnDefinition.type === 'UUID') {
    return false;
  }

  return true;
};
