import { RECORD_INDEX_FOCUS_ID } from '@/object-record/record-index/constants/RecordIndexFocusId';
import { RecordIndexHotkeyScope } from '@/object-record/record-index/types/RecordIndexHotkeyScope';
import { useRecordTableRowFocusHotkeys } from '@/object-record/record-table/hooks/useRecordTableRowFocusHotkeys';

export const RecordTableBodyFocusKeyboardEffect = () => {
  useRecordTableRowFocusHotkeys({
    focusId: RECORD_INDEX_FOCUS_ID,
    hotkeyScope: RecordIndexHotkeyScope.RecordIndex,
  });

  return null;
};
