import { useRecoilCallback, useSetRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';

import { useGetIsSomeCellInEditModeState } from '@/object-record/record-table/hooks/internal/useGetIsSomeCellInEditMode';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';

import { FieldMetadata } from '../../field/types/FieldMetadata';
import { useUpsertRecordFromState } from '../../hooks/useUpsertRecordFromState';
import { ColumnDefinition } from '../types/ColumnDefinition';
import { TableHotkeyScope } from '../types/TableHotkeyScope';

import { useDisableSoftFocus } from './internal/useDisableSoftFocus';
import { useLeaveTableFocus } from './internal/useLeaveTableFocus';
import { useResetTableRowSelection } from './internal/useResetTableRowSelection';
import { useSelectAllRows } from './internal/useSelectAllRows';
import { useSetRecordTableData } from './internal/useSetRecordTableData';
import { useSetRowSelectedState } from './internal/useSetRowSelectedState';
import { useSetSoftFocusPosition } from './internal/useSetSoftFocusPosition';

type useRecordTableProps = {
  recordTableId?: string;
};

export const useRecordTable = (props?: useRecordTableProps) => {
  const recordTableId = props?.recordTableId;

  const {
    scopeId,
    availableTableColumnsState,
    tableFiltersState,
    tableSortsState,
    tableColumnsState,
    objectMetadataConfigState,
    onEntityCountChangeState,
    softFocusPositionState,
    numberOfTableRowsState,
    onColumnsChangeState,
    isRecordTableInitialLoadingState,
    tableLastRowVisibleState,
    numberOfTableColumnsSelector,
    selectedRowIdsSelector,
  } = useRecordTableStates(recordTableId);

  const setAvailableTableColumns = useSetRecoilState(
    availableTableColumnsState(),
  );

  const setOnEntityCountChange = useSetRecoilState(onEntityCountChangeState());

  const setTableFilters = useSetRecoilState(tableFiltersState());

  const setObjectMetadataConfig = useSetRecoilState(
    objectMetadataConfigState(),
  );

  const setTableSorts = useSetRecoilState(tableSortsState());

  const setTableColumns = useSetRecoilState(tableColumnsState());

  const setOnColumnsChange = useSetRecoilState(onColumnsChangeState());

  const setIsRecordTableInitialLoading = useSetRecoilState(
    isRecordTableInitialLoadingState(),
  );

  const setRecordTableLastRowVisible = useSetRecoilState(
    tableLastRowVisibleState(),
  );

  const onColumnsChange = useRecoilCallback(
    ({ snapshot }) =>
      (columns: ColumnDefinition<FieldMetadata>[]) => {
        const onColumnsChange = getSnapshotValue(
          snapshot,
          onColumnsChangeState(),
        );

        onColumnsChange?.(columns);
      },
    [onColumnsChangeState],
  );

  const onEntityCountChange = useRecoilCallback(
    ({ snapshot }) =>
      (count: number) => {
        const onEntityCountChange = getSnapshotValue(
          snapshot,
          onEntityCountChangeState(),
        );

        onEntityCountChange?.(count);
      },
    [onEntityCountChangeState],
  );

  const setRecordTableData = useSetRecordTableData({
    recordTableId,
    onEntityCountChange,
  });

  const leaveTableFocus = useLeaveTableFocus(recordTableId);

  const setRowSelectedState = useSetRowSelectedState(recordTableId);

  const resetTableRowSelection = useResetTableRowSelection(recordTableId);

  const upsertRecordTableItem = useUpsertRecordFromState();

  const setSoftFocusPosition = useSetSoftFocusPosition(recordTableId);

  const moveUp = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const softFocusPosition = getSnapshotValue(
          snapshot,
          softFocusPositionState(),
        );

        let newRowNumber = softFocusPosition.row - 1;

        if (newRowNumber < 0) {
          newRowNumber = 0;
        }

        setSoftFocusPosition({
          ...softFocusPosition,
          row: newRowNumber,
        });
      },
    [setSoftFocusPosition, softFocusPositionState],
  );

  const moveDown = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const softFocusPosition = getSnapshotValue(
          snapshot,
          softFocusPositionState(),
        );

        const numberOfTableRows = getSnapshotValue(
          snapshot,
          numberOfTableRowsState(),
        );

        let newRowNumber = softFocusPosition.row + 1;

        if (newRowNumber >= numberOfTableRows) {
          newRowNumber = numberOfTableRows - 1;
        }

        setSoftFocusPosition({
          ...softFocusPosition,
          row: newRowNumber,
        });
      },
    [numberOfTableRowsState, setSoftFocusPosition, softFocusPositionState],
  );

  const moveRight = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const softFocusPosition = getSnapshotValue(
          snapshot,
          softFocusPositionState(),
        );

        const numberOfTableColumns = getSnapshotValue(
          snapshot,
          numberOfTableColumnsSelector,
        );

        const numberOfTableRows = getSnapshotValue(
          snapshot,
          numberOfTableRowsState(),
        );
        const currentColumnNumber = softFocusPosition.column;
        const currentRowNumber = softFocusPosition.row;

        const isLastRowAndLastColumn =
          currentColumnNumber === numberOfTableColumns - 1 &&
          currentRowNumber === numberOfTableRows - 1;

        const isLastColumnButNotLastRow =
          currentColumnNumber === numberOfTableColumns - 1 &&
          currentRowNumber !== numberOfTableRows - 1;

        const isNotLastColumn =
          currentColumnNumber !== numberOfTableColumns - 1;

        if (isLastRowAndLastColumn) {
          return;
        }

        if (isNotLastColumn) {
          setSoftFocusPosition({
            row: currentRowNumber,
            column: currentColumnNumber + 1,
          });
        } else if (isLastColumnButNotLastRow) {
          setSoftFocusPosition({
            row: currentRowNumber + 1,
            column: 0,
          });
        }
      },
    [
      softFocusPositionState,
      numberOfTableColumnsSelector,
      numberOfTableRowsState,
      setSoftFocusPosition,
    ],
  );

  const moveLeft = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const softFocusPosition = getSnapshotValue(
          snapshot,
          softFocusPositionState(),
        );

        const numberOfTableColumns = getSnapshotValue(
          snapshot,
          numberOfTableColumnsSelector,
        );

        const currentColumnNumber = softFocusPosition.column;
        const currentRowNumber = softFocusPosition.row;

        const isFirstRowAndFirstColumn =
          currentColumnNumber === 0 && currentRowNumber === 0;

        const isFirstColumnButNotFirstRow =
          currentColumnNumber === 0 && currentRowNumber > 0;

        const isNotFirstColumn = currentColumnNumber > 0;

        if (isFirstRowAndFirstColumn) {
          return;
        }

        if (isNotFirstColumn) {
          setSoftFocusPosition({
            row: currentRowNumber,
            column: currentColumnNumber - 1,
          });
        } else if (isFirstColumnButNotFirstRow) {
          setSoftFocusPosition({
            row: currentRowNumber - 1,
            column: numberOfTableColumns - 1,
          });
        }
      },
    [
      softFocusPositionState,
      numberOfTableColumnsSelector,
      setSoftFocusPosition,
    ],
  );

  const useMapKeyboardToSoftFocus = () => {
    const disableSoftFocus = useDisableSoftFocus(recordTableId);
    const setHotkeyScope = useSetHotkeyScope();

    useScopedHotkeys(
      [Key.ArrowUp, `${Key.Shift}+${Key.Enter}`],
      () => {
        moveUp();
      },
      TableHotkeyScope.TableSoftFocus,
      [moveUp],
    );

    useScopedHotkeys(
      Key.ArrowDown,
      () => {
        moveDown();
      },
      TableHotkeyScope.TableSoftFocus,
      [moveDown],
    );

    useScopedHotkeys(
      [Key.ArrowLeft, `${Key.Shift}+${Key.Tab}`],
      () => {
        moveLeft();
      },
      TableHotkeyScope.TableSoftFocus,
      [moveLeft],
    );

    useScopedHotkeys(
      [Key.ArrowRight, Key.Tab],
      () => {
        moveRight();
      },
      TableHotkeyScope.TableSoftFocus,
      [moveRight],
    );

    useScopedHotkeys(
      [Key.Escape],
      () => {
        setHotkeyScope(TableHotkeyScope.Table, {
          goto: true,
          keyboardShortcutMenu: true,
        });
        disableSoftFocus();
      },
      TableHotkeyScope.TableSoftFocus,
      [disableSoftFocus],
    );
  };

  const { selectAllRows } = useSelectAllRows(recordTableId);

  const isSomeCellInEditModeState =
    useGetIsSomeCellInEditModeState(recordTableId);

  return {
    scopeId,
    onColumnsChange,
    setAvailableTableColumns,
    setTableFilters,
    setTableSorts,
    setObjectMetadataConfig,
    setOnEntityCountChange,
    setRecordTableData,
    setTableColumns,
    leaveTableFocus,
    setRowSelectedState,
    resetTableRowSelection,
    upsertRecordTableItem,
    moveDown,
    moveLeft,
    moveRight,
    moveUp,
    useMapKeyboardToSoftFocus,
    selectAllRows,
    setOnColumnsChange,
    setIsRecordTableInitialLoading,
    setRecordTableLastRowVisible,
    setSoftFocusPosition,
    isSomeCellInEditModeState,
    selectedRowIdsSelector,
  };
};
