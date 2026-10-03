import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { useResetRecordSelection } from '@/object-record/record-selection/hooks/useResetRecordSelection';
import { useSelectAllRows } from '@/object-record/record-table/hooks/internal/useSelectAllRows';
import { useActiveRecordTableRow } from '@/object-record/record-table/hooks/useActiveRecordTableRow';
import { useFocusedRecordTableRow } from '@/object-record/record-table/hooks/useFocusedRecordTableRow';
import { useFocusRecordTableCell } from '@/object-record/record-table/record-table-cell/hooks/useFocusRecordTableCell';
import { getRecordTableCellFocusId } from '@/object-record/record-table/record-table-cell/utils/getRecordTableCellFocusId';
import { useToggleRecordSelection } from '@/object-record/record-selection/hooks/useToggleRecordSelection';
import { isAtLeastOneRecordSelectedComponentSelector } from '@/object-record/record-selection/states/selectors/isAtLeastOneRecordSelectedComponentSelector';
import { isRecordTableRowFocusActiveComponentState } from '@/object-record/record-table/states/isRecordTableRowFocusActiveComponentState';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { Key } from 'ts-key-enum';

export const useRecordTableRowHotkeys = (focusId: string) => {
  const { recordId, objectNameSingular, rowIndex } =
    useRecordTableRowContextOrThrow();

  const { toggleRecordSelection } = useToggleRecordSelection();

  const { openRecordInSidePanel } = useOpenRecordInSidePanel();

  const { activateRecordTableRow } = useActiveRecordTableRow();

  const setIsRecordTableRowFocusActive = useSetAtomComponentState(
    isRecordTableRowFocusActiveComponentState,
  );

  const { focusRecordTableCell } = useFocusRecordTableCell();

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();

  const { recordTableId } = useRecordTableContextOrThrow();

  const handleSelectRow = () => {
    toggleRecordSelection({ recordId });
  };

  const handleSelectRowWithShift = () => {
    toggleRecordSelection({ recordId, shouldSelectRange: true });
  };

  const handleOpenRecordInSidePanel = () => {
    openRecordInSidePanel({
      recordId: recordId,
      objectNameSingular: objectNameSingular,
      isNewRecord: false,
    });

    activateRecordTableRow(rowIndex);
  };

  const handleEnterRow = () => {
    setIsRecordTableRowFocusActive(false);
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

  const { resetRecordSelection } = useResetRecordSelection(recordTableId);

  const { unfocusRecordTableRow } = useFocusedRecordTableRow(recordTableId);

  const isAtLeastOneRecordSelected = useAtomComponentSelectorValue(
    isAtLeastOneRecordSelectedComponentSelector,
    recordTableId,
  );

  const handleEscape = () => {
    unfocusRecordTableRow();
    if (isAtLeastOneRecordSelected) {
      resetRecordSelection();
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
    callback: handleOpenRecordInSidePanel,
    focusId,
    dependencies: [handleOpenRecordInSidePanel],
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

  const { selectAllRows } = useSelectAllRows();

  const handleSelectAllRows = () => {
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
