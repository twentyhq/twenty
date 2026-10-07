import { Key } from 'ts-key-enum';

import { useResetRecordSelection } from '@/object-record/record-selection/hooks/useResetRecordSelection';
import { PageFocusId } from '@/types/PageFocusId';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';

export const RecordSelectionEscapeHotkeyEffect = () => {
  const { resetRecordSelection } = useResetRecordSelection();

  useHotkeysOnFocusedElement({
    keys: [Key.Escape],
    callback: resetRecordSelection,
    focusId: PageFocusId.RecordIndex,
    dependencies: [resetRecordSelection],
  });

  return null;
};
