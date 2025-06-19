import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecordTableMoveFocusedRow } from '@/object-record/record-table/hooks/useRecordTableMoveFocusedRow';
import { TableHotkeyScope } from '@/object-record/record-table/types/TableHotkeyScope';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { Key } from 'ts-key-enum';

export const useRecordTableRowArrowKeys = (focusId: string) => {
  const { recordTableId } = useRecordTableContextOrThrow();

  const { moveFocusedRow } = useRecordTableMoveFocusedRow(recordTableId);

  useHotkeysOnFocusedElement({
    keys: [Key.ArrowUp, `${Key.Shift}+${Key.Enter}`],
    callback: () => {
      moveFocusedRow('up');
    },
    focusId,
    scope: TableHotkeyScope.TableFocus,
    dependencies: [moveFocusedRow],
  });

  useHotkeysOnFocusedElement({
    keys: [Key.ArrowDown],
    callback: () => {
      moveFocusedRow('down');
    },
    focusId,
    scope: TableHotkeyScope.TableFocus,
    dependencies: [moveFocusedRow],
  });
};
