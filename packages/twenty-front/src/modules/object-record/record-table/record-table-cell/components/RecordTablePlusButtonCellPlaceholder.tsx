import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RECORD_TABLE_PLUS_BUTTON_COLUMN_WIDTH } from '@/object-record/record-table/hooks/useRecordTableLastColumnWidthToFill';
import { RecordTableTd } from '@/object-record/record-table/record-table-cell/components/RecordTableTd';

export const RecordTablePlusButtonCellPlaceholder = () => {
  const { isSelected } = useRecordTableRowContextOrThrow();

  return (
    <RecordTableTd
      isSelected={isSelected}
      hasRightBorder={false}
      width={RECORD_TABLE_PLUS_BUTTON_COLUMN_WIDTH}
    />
  );
};
