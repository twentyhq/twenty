import { Key } from 'ts-key-enum';

import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { isAtLeastOneTableRowSelectedSelector } from '@/object-record/record-table/record-table-row/states/isAtLeastOneTableRowSelectedSelector';
import { PageFocusId } from '@/types/PageFocusId';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

export const RecordTableBodyEscapeHotkeyEffect = () => {
  const { recordTableId } = useRecordTableContextOrThrow();

  const { resetTableRowSelection } = useRecordTable({
    recordTableId,
  });

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
