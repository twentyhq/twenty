import { RECORD_TABLE_COLUMN_LAST_EMPTY_COLUMN_WIDTH_CLASS_NAME } from '@/object-record/record-table/constants/RecordTableColumnLastEmptyColumnWidthClassName';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableCellStyleWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellStyleWrapper';

export const RecordTableLastEmptyCell = () => {
  const { isSelected } = useRecordTableRowContextOrThrow();

  return (
    <RecordTableCellStyleWrapper
      isSelected={isSelected}
      hasRightBorder={false}
      widthClassName={RECORD_TABLE_COLUMN_LAST_EMPTY_COLUMN_WIDTH_CLASS_NAME}
    />
  );
};
