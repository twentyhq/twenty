import { Key } from 'ts-key-enum';

import { useDeleteSelectedRecords } from '@/object-record/record-table/hooks/useDeleteSelectedRecords';
import { isAtLeastOneTableRowSelectedSelector } from '@/object-record/record-table/record-table-row/states/isAtLeastOneTableRowSelectedSelector';
import { PageFocusId } from '@/types/PageFocusId';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';

export const RecordTableBodyDeleteHotkeyEffect = () => {
  const { deleteSelectedRecords } = useDeleteSelectedRecords();

  const isAtLeastOneRecordSelected = useAtomComponentSelectorValue(
    isAtLeastOneTableRowSelectedSelector,
  );

  const handleDelete = () => {
    if (isAtLeastOneRecordSelected) {
      deleteSelectedRecords();
    }
  };

  useHotkeysOnFocusedElement({
    keys: [Key.Delete, Key.Backspace],
    callback: handleDelete,
    focusId: PageFocusId.RecordIndex,
    dependencies: [handleDelete],
    options: {
      preventDefault: true,
    },
  });

  return null;
};
