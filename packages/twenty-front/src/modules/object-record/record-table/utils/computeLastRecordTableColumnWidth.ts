import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { RECORD_TABLE_COLUMN_ADD_COLUMN_BUTTON_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnAddColumnButtonWidth';
import { RECORD_TABLE_COLUMN_CHECKBOX_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnCheckboxWidth';
import { RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnDragAndDropWidth';
import { sumByProperty } from 'twenty-shared/utils';

export const computeLastRecordTableColumnWidth = ({
  recordFields,
  tableWidth,
}: {
  recordFields: Pick<RecordField, 'size'>[];
  tableWidth: number;
}) => {
  const totalColumnsWidth = recordFields.reduce(sumByProperty('size'), 0);

  const widthOfBorders = recordFields.length;

  const fixedColumnsWidth =
    RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH +
    RECORD_TABLE_COLUMN_CHECKBOX_WIDTH +
    RECORD_TABLE_COLUMN_ADD_COLUMN_BUTTON_WIDTH +
    widthOfBorders;

  const remainingWidthToFill = Math.max(
    0,
    tableWidth - fixedColumnsWidth - totalColumnsWidth,
  );

  const lastColumnWidth = remainingWidthToFill;

  return {
    lastColumnWidth,
  };
};
