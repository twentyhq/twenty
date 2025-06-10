import { useOpenRecordInCommandMenu } from '@/command-menu/hooks/useOpenRecordInCommandMenu';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { useSetRecordTableFocusPosition } from '@/object-record/record-table/hooks/internal/useSetRecordTableFocusPosition';
import { useActiveRecordTableRow } from '@/object-record/record-table/hooks/useActiveRecordTableRow';
import { useSetCurrentRowSelected } from '@/object-record/record-table/record-table-row/hooks/useSetCurrentRowSelected';
import { isRecordTableRowFocusActiveComponentState } from '@/object-record/record-table/states/isRecordTableRowFocusActiveComponentState';
import { TableHotkeyScope } from '@/object-record/record-table/types/TableHotkeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { Key } from 'ts-key-enum';

export const RecordTableRowHotkeyEffect = () => {
  const { isSelected, recordId, objectNameSingular, rowIndex } =
    useRecordTableRowContextOrThrow();

  const { setCurrentRowSelected } = useSetCurrentRowSelected();

  const { openRecordInCommandMenu } = useOpenRecordInCommandMenu();

  const { activateRecordTableRow } = useActiveRecordTableRow();

  const setIsRowFocusActive = useSetRecoilComponentStateV2(
    isRecordTableRowFocusActiveComponentState,
  );

  const setFocusPosition = useSetRecordTableFocusPosition();

  useScopedHotkeys(
    'x',
    () => {
      setCurrentRowSelected(!isSelected);
    },
    TableHotkeyScope.TableFocus,
  );

  useScopedHotkeys(
    [`${Key.Control}+${Key.Enter}`, `${Key.Meta}+${Key.Enter}`],
    () => {
      openRecordInCommandMenu({
        recordId: recordId,
        objectNameSingular: objectNameSingular,
        isNewRecord: false,
      });

      activateRecordTableRow(rowIndex);
    },
    TableHotkeyScope.TableFocus,
  );

  useScopedHotkeys(
    Key.Enter,
    () => {
      setIsRowFocusActive(false);
      setFocusPosition({
        row: rowIndex,
        column: 0,
      });
    },
    TableHotkeyScope.TableFocus,
  );

  return null;
};
