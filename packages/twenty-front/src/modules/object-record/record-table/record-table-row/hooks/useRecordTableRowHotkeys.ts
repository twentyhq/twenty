import { useOpenRecordInCommandMenu } from '@/command-menu/hooks/useOpenRecordInCommandMenu';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { useSetRecordTableFocusPosition } from '@/object-record/record-table/hooks/internal/useSetRecordTableFocusPosition';
import { useActiveRecordTableRow } from '@/object-record/record-table/hooks/useActiveRecordTableRow';
import { useSetCurrentRowSelected } from '@/object-record/record-table/record-table-row/hooks/useSetCurrentRowSelected';
import { isRecordTableRowFocusActiveComponentState } from '@/object-record/record-table/states/isRecordTableRowFocusActiveComponentState';
import { TableHotkeyScope } from '@/object-record/record-table/types/TableHotkeyScope';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { Key } from 'ts-key-enum';

export const useRecordTableRowHotkeys = (focusId: string) => {
  const { isSelected, recordId, objectNameSingular, rowIndex } =
    useRecordTableRowContextOrThrow();

  const { setCurrentRowSelected } = useSetCurrentRowSelected();

  const { openRecordInCommandMenu } = useOpenRecordInCommandMenu();

  const { activateRecordTableRow } = useActiveRecordTableRow();

  const setIsRowFocusActive = useSetRecoilComponentStateV2(
    isRecordTableRowFocusActiveComponentState,
  );

  const setFocusPosition = useSetRecordTableFocusPosition();

  const handleSelectRow = () => {
    setCurrentRowSelected({
      newSelectedState: !isSelected,
    });
  };

  const handleSelectRowWithShift = () => {
    setCurrentRowSelected({
      newSelectedState: !isSelected,
      shouldSelectRange: true,
    });
  };

  const handleOpenRecordInCommandMenu = () => {
    openRecordInCommandMenu({
      recordId: recordId,
      objectNameSingular: objectNameSingular,
      isNewRecord: false,
    });

    activateRecordTableRow(rowIndex);
  };

  const handleEnterRow = () => {
    setIsRowFocusActive(false);
    setFocusPosition({
      row: rowIndex,
      column: 0,
    });
  };

  useHotkeysOnFocusedElement({
    keys: ['x'],
    callback: handleSelectRow,
    focusId,
    scope: TableHotkeyScope.TableFocus,
    dependencies: [handleSelectRow],
  });

  useHotkeysOnFocusedElement({
    keys: [`${Key.Shift}+x`],
    callback: handleSelectRowWithShift,
    focusId,
    scope: TableHotkeyScope.TableFocus,
    dependencies: [handleSelectRowWithShift],
  });

  useHotkeysOnFocusedElement({
    keys: [`${Key.Control}+${Key.Enter}`, `${Key.Meta}+${Key.Enter}`],
    callback: handleOpenRecordInCommandMenu,
    focusId,
    scope: TableHotkeyScope.TableFocus,
    dependencies: [handleOpenRecordInCommandMenu],
  });

  useHotkeysOnFocusedElement({
    keys: [Key.Enter],
    callback: handleEnterRow,
    focusId,
    scope: TableHotkeyScope.TableFocus,
    dependencies: [handleEnterRow],
  });
};
