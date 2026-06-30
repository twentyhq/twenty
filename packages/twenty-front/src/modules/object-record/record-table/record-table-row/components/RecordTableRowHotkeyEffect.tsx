import { useRecordTableRowFocusId } from '@/object-record/record-table/record-table-row/hooks/useRecordTableRowFocusId';
import { useRecordTableRowHotkeys } from '@/object-record/record-table/record-table-row/hooks/useRecordTableRowHotkeys';

export const RecordTableRowHotkeyEffect = () => {
  const recordTableRowFocusId = useRecordTableRowFocusId();

  useRecordTableRowHotkeys(recordTableRowFocusId);

  return null;
};
