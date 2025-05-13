import { RecordIndexHotkeyScope } from '@/object-record/record-index/types/RecordIndexHotkeyScope';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useFocusedRecordTableRow } from '@/object-record/record-table/hooks/useFocusedRecordTableRow';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { useSetIsRecordTableFocusActive } from '@/object-record/record-table/record-table-cell/hooks/useSetIsRecordTableFocusActive';
import { isRecordTableCellFocusActiveComponentState } from '@/object-record/record-table/states/isRecordTableCellFocusActiveComponentState';
import { TableHotkeyScope } from '@/object-record/record-table/types/TableHotkeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { Key } from 'ts-key-enum';

export const RecordTableBodyFocusKeyboardEffect = () => {
  const { recordTableId } = useRecordTableContextOrThrow();

  const { useMapKeyboardToFocus } = useRecordTable({
    recordTableId,
  });

  const setHotkeyScope = useSetHotkeyScope();

  const { restoreRecordTableRowFocusFromCellPosition } =
    useFocusedRecordTableRow(recordTableId);

  const { setIsFocusActiveForCurrentPosition } =
    useSetIsRecordTableFocusActive(recordTableId);

  const isRecordTableFocusActive = useRecoilComponentValueV2(
    isRecordTableCellFocusActiveComponentState,
  );

  useMapKeyboardToFocus();

  useScopedHotkeys(
    [Key.Escape],
    () => {
      if (isRecordTableFocusActive) {
        restoreRecordTableRowFocusFromCellPosition();
        setIsFocusActiveForCurrentPosition(false);
      } else {
        setHotkeyScope(RecordIndexHotkeyScope.RecordIndex, {
          goto: true,
          keyboardShortcutMenu: true,
        });
      }
    },
    TableHotkeyScope.TableFocus,
    [
      setIsFocusActiveForCurrentPosition,
      restoreRecordTableRowFocusFromCellPosition,
      setHotkeyScope,
      isRecordTableFocusActive,
    ],
  );

  return <></>;
};
