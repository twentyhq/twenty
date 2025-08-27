import { TABLE_COLUMNS_DENY_LIST } from '@/object-record/constants/TableColumnsDenyList';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';

export const filterAvailableTableColumns = (
  columnDefinition: ColumnDefinition<FieldMetadata>,
): boolean => {
  if (TABLE_COLUMNS_DENY_LIST.includes(columnDefinition.metadata.fieldName)) {
    return false;
  }

  if (columnDefinition.type === 'UUID') {
    return false;
  }

  return true;
};
