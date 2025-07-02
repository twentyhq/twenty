import { RecordIndexHotkeyScope } from '@/object-record/record-index/types/RecordIndexHotkeyScope';
import { useCurrentlyFocusedRecordTableCellFocusId } from '@/object-record/record-table/record-table-cell/hooks/useCurrentlyFocusedRecordTableCellFocusId';
import { useRecordTableCellFocusHotkeys } from '@/object-record/record-table/record-table-cell/hooks/useRecordTableCellFocusHotkeys';

export const RecordTableCellArrowKeysEffect = () => {
  const recordTableCellFocusId = useCurrentlyFocusedRecordTableCellFocusId();

  useRecordTableCellFocusHotkeys({
    focusId: recordTableCellFocusId,
    hotkeyScope: RecordIndexHotkeyScope.RecordIndex,
  });

  return null;
};
