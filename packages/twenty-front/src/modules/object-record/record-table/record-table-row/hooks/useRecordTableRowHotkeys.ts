import { useOpenRecordInCommandMenu } from '@/command-menu/hooks/useOpenRecordInCommandMenu';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { useActiveRecordTableRow } from '@/object-record/record-table/hooks/useActiveRecordTableRow';
import { useFocusedRecordTableRow } from '@/object-record/record-table/hooks/useFocusedRecordTableRow';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { useFocusRecordTableCell } from '@/object-record/record-table/record-table-cell/hooks/useFocusRecordTableCell';
import { getRecordTableCellFocusId } from '@/object-record/record-table/record-table-cell/utils/getRecordTableCellFocusId';
import { useSetCurrentRowSelected } from '@/object-record/record-table/record-table-row/hooks/useSetCurrentRowSelected';
import { isAtLeastOneTableRowSelectedSelector } from '@/object-record/record-table/record-table-row/states/isAtLeastOneTableRowSelectedSelector';
import { isRecordTableRowFocusActiveComponentState } from '@/object-record/record-table/states/isRecordTableRowFocusActiveComponentState';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { Key } from 'ts-key-enum';

export const useRecordTableRowHotkeys = (focusId: string) => {
  const { isSelected, recordId, objectNameSingular, rowIndex } =
    useRecordTableRowContextOrThrow();

  const { setCurrentRowSelected } = useSetCurrentRowSelected();

  const { openRecordInCommandMenu } = useOpenRecordInCommandMenu();

  const { activateRecordTableRow } = useActiveRecordTableRow();

  const setIsRowFocusActive = useSetRecoilComponentState(
    isRecordTableRowFocusActiveComponentState,
  );

  const { focusRecordTableCell } = useFocusRecordTableCell();

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();

  const { recordTableId } = useRecordTableContextOrThrow();

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
    const cellPosition = {
      row: rowIndex,
      column: 0,
    };
    focusRecordTableCell(cellPosition);

    const cellFocusId = getRecordTableCellFocusId({
      recordTableId,
      cellPosition,
    });

    pushFocusItemToFocusStack({
      focusId: cellFocusId,
      component: {
        type: FocusComponentType.RECORD_TABLE_CELL,
        instanceId: cellFocusId,
      },
    });
  };

  const { resetTableRowSelection } = useRecordTable({
    recordTableId,
  });

  const { unfocusRecordTableRow } = useFocusedRecordTableRow(recordTableId);

  const isAtLeastOneRecordSelected = useRecoilComponentValue(
    isAtLeastOneTableRowSelectedSelector,
  );

  const handleEscape = () => {
    unfocusRecordTableRow();
    if (isAtLeastOneRecordSelected) {
      resetTableRowSelection();
    }
  };

  useHotkeysOnFocusedElement({
    keys: ['x'],
    callback: handleSelectRow,
    focusId,
    dependencies: [handleSelectRow],
  });

  useHotkeysOnFocusedElement({
    keys: [`${Key.Shift}+x`],
    callback: handleSelectRowWithShift,
    focusId,
    dependencies: [handleSelectRowWithShift],
  });

  useHotkeysOnFocusedElement({
    keys: [`${Key.Control}+${Key.Enter}`, `${Key.Meta}+${Key.Enter}`],
    callback: handleOpenRecordInCommandMenu,
    focusId,
    dependencies: [handleOpenRecordInCommandMenu],
  });

  useHotkeysOnFocusedElement({
    keys: [Key.Enter],
    callback: handleEnterRow,
    focusId,
    dependencies: [handleEnterRow],
  });

  useHotkeysOnFocusedElement({
    keys: [Key.Escape],
    callback: handleEscape,
    focusId,
    dependencies: [handleEscape],
  });

  const { selectAllRows, setHasUserSelectedAllRows } = useRecordTable({
    recordTableId,
  });

  const handleSelectAllRows = () => {
    setHasUserSelectedAllRows(true);
    selectAllRows();
  };

  useHotkeysOnFocusedElement({
    keys: ['ctrl+a,meta+a'],
    callback: handleSelectAllRows,
    focusId,
    dependencies: [handleSelectAllRows],
    options: {
      enableOnFormTags: false,
    },
  });
};
