import { RecordIndexHotkeyScope } from '@/object-record/record-index/types/RecordIndexHotkeyScope';
import { useRecordTableRowFocusHotkeys } from '@/object-record/record-table/hooks/useRecordTableRowFocusHotkeys';
import { useRecordTableRowFocusId } from '@/object-record/record-table/record-table-row/hooks/useRecordTableRowFocusId';

export const RecordTableRowArrowKeysEffect = () => {
  const recordTableRowFocusId = useRecordTableRowFocusId();

  useRecordTableRowFocusHotkeys({
    focusId: recordTableRowFocusId,
    hotkeyScope: RecordIndexHotkeyScope.RecordIndex,
  });

  return null;
};
