import { Key } from 'ts-key-enum';

import { useResetTableRowSelection } from '@/object-record/record-table/hooks/internal/useResetTableRowSelection';
import { isAtLeastOneTableRowSelectedSelector } from '@/object-record/record-table/record-table-row/states/isAtLeastOneTableRowSelectedSelector';
import { PageFocusId } from '@/types/PageFocusId';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

export const RecordTableBodyEscapeHotkeyEffect = () => {
  const { resetTableRowSelection } = useResetTableRowSelection();

  const isAtLeastOneRecordSelected = useRecoilComponentValue(
    isAtLeastOneTableRowSelectedSelector,
  );

  const handleEscape = () => {
    if (isAtLeastOneRecordSelected) {
      resetTableRowSelection();
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
