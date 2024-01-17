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
    getAvailableTableColumnsState,
    getTableFiltersState,
    getTableSortsState,
    getTableColumnsState,
    getObjectMetadataConfigState,
    getOnEntityCountChangeState,
    getSoftFocusPositionState,
    getNumberOfTableRowsState,
    getOnColumnsChangeState,
    getIsRecordTableInitialLoadingState,
    getTableLastRowVisibleState,
    numberOfTableColumnsSelector,
    selectedRowIdsSelector,
  } = useRecordTableStates(recordTableId);

  const setAvailableTableColumns = useSetRecoilState(
    getAvailableTableColumnsState(),
  );

  const setOnEntityCountChange = useSetRecoilState(
    getOnEntityCountChangeState(),
  );

  const setTableFilters = useSetRecoilState(getTableFiltersState());

  const setObjectMetadataConfig = useSetRecoilState(
    getObjectMetadataConfigState(),
  );

  const setTableSorts = useSetRecoilState(getTableSortsState());

  const setTableColumns = useSetRecoilState(getTableColumnsState());

  const setOnColumnsChange = useSetRecoilState(getOnColumnsChangeState());

  const setIsRecordTableInitialLoading = useSetRecoilState(
    getIsRecordTableInitialLoadingState(),
  );

  const setRecordTableLastRowVisible = useSetRecoilState(
    getTableLastRowVisibleState(),
  );

  const onColumnsChange = useRecoilCallback(
    ({ snapshot }) =>
      (columns: ColumnDefinition<FieldMetadata>[]) => {
        const onColumnsChange = getSnapshotValue(
          snapshot,
          getOnColumnsChangeState(),
        );

        onColumnsChange?.(columns);
      },
    [getOnColumnsChangeState],
  );

  const onEntityCountChange = useRecoilCallback(
    ({ snapshot }) =>
      (count: number) => {
        const onEntityCountChange = getSnapshotValue(
          snapshot,
          getOnEntityCountChangeState(),
        );

        onEntityCountChange?.(count);
      },
    [getOnEntityCountChangeState],
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
          getSoftFocusPositionState(),
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
    [getSoftFocusPositionState, setSoftFocusPosition],
  );

  const moveDown = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const softFocusPosition = getSnapshotValue(
          snapshot,
          getSoftFocusPositionState(),
        );

        const numberOfTableRows = getSnapshotValue(
          snapshot,
          getNumberOfTableRowsState(),
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
    [
      getNumberOfTableRowsState,
      setSoftFocusPosition,
      getSoftFocusPositionState,
    ],
  );

  const moveRight = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const softFocusPosition = getSnapshotValue(
          snapshot,
          getSoftFocusPositionState(),
        );

        const numberOfTableColumns = getSnapshotValue(
          snapshot,
          numberOfTableColumnsSelector,
        );

        const numberOfTableRows = getSnapshotValue(
          snapshot,
          getNumberOfTableRowsState(),
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
      getSoftFocusPositionState,
      numberOfTableColumnsSelector,
      getNumberOfTableRowsState,
      setSoftFocusPosition,
    ],
  );

  const moveLeft = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const softFocusPosition = getSnapshotValue(
          snapshot,
          getSoftFocusPositionState(),
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
      getSoftFocusPositionState,
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
