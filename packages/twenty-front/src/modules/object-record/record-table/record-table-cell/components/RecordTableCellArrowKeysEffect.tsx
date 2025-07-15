import { useCurrentlyFocusedRecordTableCellFocusId } from '@/object-record/record-table/record-table-cell/hooks/useCurrentlyFocusedRecordTableCellFocusId';
import { useRecordTableCellFocusHotkeys } from '@/object-record/record-table/record-table-cell/hooks/useRecordTableCellFocusHotkeys';

export const RecordTableCellArrowKeysEffect = () => {
  const recordTableCellFocusId = useCurrentlyFocusedRecordTableCellFocusId();

  useRecordTableCellFocusHotkeys({
    focusId: recordTableCellFocusId,
  });

  return null;
};
