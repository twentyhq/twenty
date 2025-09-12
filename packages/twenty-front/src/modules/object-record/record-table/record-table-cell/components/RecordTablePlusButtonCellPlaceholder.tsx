import { RECORD_TABLE_COLUMN_ADD_COLUMN_BUTTON_WIDTH_CLASS_NAME } from '@/object-record/record-table/constants/RecordTableColumnAddColumnButtonWidthClassName';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableCellStyleWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellStyleWrapper';

export const RecordTablePlusButtonCellPlaceholder = () => {
  const { isSelected } = useRecordTableRowContextOrThrow();

  return (
    <RecordTableCellStyleWrapper
      isSelected={isSelected}
      hasRightBorder={false}
      widthClassName={RECORD_TABLE_COLUMN_ADD_COLUMN_BUTTON_WIDTH_CLASS_NAME}
    />
  );
};
