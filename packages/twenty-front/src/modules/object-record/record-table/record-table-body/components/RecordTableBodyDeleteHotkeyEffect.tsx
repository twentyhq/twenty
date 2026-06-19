import { Key } from 'ts-key-enum';

import { useDeleteSelectedRecords } from '@/object-record/record-table/hooks/useDeleteSelectedRecords';
import { PageFocusId } from '@/types/PageFocusId';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';

export const RecordTableBodyDeleteHotkeyEffect = () => {
  const { deleteSelectedRecords } = useDeleteSelectedRecords();

  useHotkeysOnFocusedElement({
    keys: [Key.Delete, Key.Backspace],
    callback: deleteSelectedRecords,
    focusId: PageFocusId.RecordIndex,
    dependencies: [deleteSelectedRecords],
    options: {
      preventDefault: true,
    },
  });

  return null;
};
