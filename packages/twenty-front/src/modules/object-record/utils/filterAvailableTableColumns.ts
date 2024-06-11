import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { isFieldRelation } from '@/object-record/record-field/types/guards/isFieldRelation';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';

const tableColumnsDenyList = [
  'attachments',
  'activities',
  'timelineActivities',
];

export const filterAvailableTableColumns = (
  columnDefinition: ColumnDefinition<FieldMetadata>,
): boolean => {
  if (
    isFieldRelation(columnDefinition) &&
    columnDefinition.metadata?.relationType !== 'TO_ONE_OBJECT' &&
    columnDefinition.metadata?.relationType !== 'FROM_MANY_OBJECTS'
  ) {
    return false;
  }

  if (tableColumnsDenyList.includes(columnDefinition.metadata.fieldName)) {
    return false;
  }

  if (columnDefinition.type === 'UUID') {
    return false;
  }

  return true;
};
