import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecordTableMoveFocusedRow } from '@/object-record/record-table/hooks/useRecordTableMoveFocusedRow';
import { TableHotkeyScope } from '@/object-record/record-table/types/TableHotkeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { Key } from 'ts-key-enum';

export const RecordTableBodyRowFocusKeyboardEffect = () => {
  const { recordTableId } = useRecordTableContextOrThrow();

  const { moveFocusedRow } = useRecordTableMoveFocusedRow(recordTableId);

  useScopedHotkeys(
    [Key.ArrowUp, 'k'],
    () => {
      moveFocusedRow('up');
    },
    TableHotkeyScope.TableFocus,
    [moveFocusedRow],
  );

  useScopedHotkeys(
    [Key.ArrowDown, 'j'],
    () => {
      moveFocusedRow('down');
    },
    TableHotkeyScope.TableFocus,
    [moveFocusedRow],
  );

  return <></>;
};
