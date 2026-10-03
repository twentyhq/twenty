import { Key } from 'ts-key-enum';

import { useResetRecordSelection } from '@/object-record/record-selection/hooks/useResetRecordSelection';
import { isAtLeastOneRecordSelectedComponentSelector } from '@/object-record/record-selection/states/selectors/isAtLeastOneRecordSelectedComponentSelector';
import { PageFocusId } from '@/types/PageFocusId';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';

export const RecordSelectionEscapeHotkeyEffect = () => {
  const { resetRecordSelection } = useResetRecordSelection();

  const isAtLeastOneRecordSelected = useAtomComponentSelectorValue(
    isAtLeastOneRecordSelectedComponentSelector,
  );

  const handleEscape = () => {
    if (isAtLeastOneRecordSelected) {
      resetRecordSelection();
    }
  };

  useHotkeysOnFocusedElement({
    keys: [Key.Escape],
    callback: handleEscape,
    focusId: PageFocusId.RecordIndex,
    dependencies: [handleEscape],
    options: {
      preventDefault: true,
    },
  });

  return null;
};
