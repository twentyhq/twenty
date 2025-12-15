import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { RECORD_TABLE_COLUMN_ADD_COLUMN_BUTTON_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnAddColumnButtonWidth';
import { RECORD_TABLE_COLUMN_CHECKBOX_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnCheckboxWidth';
import { RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnDragAndDropWidth';
import { computeVisibleRecordFieldsWidthOnTable } from '@/object-record/record-table/utils/computeVisibleRecordFieldsWidthOnTable';

export const computeLastRecordTableColumnWidth = ({
  recordFields,
  tableWidth,
  shouldCompactFirstColumn,
}: {
  recordFields: Pick<RecordField, 'size'>[];
  tableWidth: number;
  shouldCompactFirstColumn: boolean;
}) => {
  const { visibleRecordFieldsWidth } = computeVisibleRecordFieldsWidthOnTable({
    shouldCompactFirstColumn,
    visibleRecordFields: recordFields,
  });

  const widthOfBorders = recordFields.length;

  const fixedColumnsWidth =
    RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH +
    RECORD_TABLE_COLUMN_CHECKBOX_WIDTH +
    RECORD_TABLE_COLUMN_ADD_COLUMN_BUTTON_WIDTH +
    widthOfBorders;

  const remainingWidthToFill = Math.max(
    0,
    tableWidth - fixedColumnsWidth - visibleRecordFieldsWidth,
  );

  const lastColumnWidth = remainingWidthToFill;

  return {
    lastColumnWidth,
  };
};
