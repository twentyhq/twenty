import { RecordIndexHotkeyScope } from '@/object-record/record-index/types/RecordIndexHotkeyScope';
import { useRecordTableRowFocusHotkeys } from '@/object-record/record-table/hooks/useRecordTableRowFocusHotkeys';
import { PageFocusId } from '@/types/PageFocusId';

export const RecordTableBodyFocusKeyboardEffect = () => {
  useRecordTableRowFocusHotkeys({
    focusId: PageFocusId.RecordIndex,
    hotkeyScope: RecordIndexHotkeyScope.RecordIndex,
  });

  return null;
};
