import { useRecordTableRowFocusHotkeys } from '@/object-record/record-table/hooks/useRecordTableRowFocusHotkeys';
import { PageFocusId } from '@/ui/utilities/focus/types/PageFocusId';

export const RecordTableBodyFocusKeyboardEffect = () => {
  useRecordTableRowFocusHotkeys({
    focusId: PageFocusId.RecordIndex,
  });

  return null;
};
