import { useRecoilCallback, useSetRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';

import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { useGetIsSomeCellInEditModeState } from '@/object-record/record-table/hooks/internal/useGetIsSomeCellInEditMode';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { useSetHasUserSelectedAllRows } from '@/object-record/record-table/hooks/internal/useSetAllRowSelectedState';
import { useRecordTableMoveFocus } from '@/object-record/record-table/hooks/useRecordTableMoveFocus';
import { isSoftFocusUsingMouseState } from '@/object-record/record-table/states/isSoftFocusUsingMouseState';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

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
    onEntityCountChangeState,
    onColumnsChangeState,
    isRecordTableInitialLoadingState,
    tableLastRowVisibleState,
    selectedRowIdsSelector,
    onToggleColumnFilterState,
    onToggleColumnSortState,
    pendingRecordIdState,
    hasUserSelectedAllRowsState,
  } = useRecordTableStates(recordTableId);

  const setAvailableTableColumns = useRecoilCallback(
    ({ snapshot, set }) =>
      (columns: ColumnDefinition<FieldMetadata>[]) => {
        const availableTableColumns = getSnapshotValue(
          snapshot,
          availableTableColumnsState,
        );

        if (isDeeplyEqual(availableTableColumns, columns)) {
          return;
        }
        set(availableTableColumnsState, columns);
      },
    [availableTableColumnsState],
  );

  const setOnEntityCountChange = useSetRecoilState(onEntityCountChangeState);

  const setTableFilters = useSetRecoilState(tableFiltersState);

  const setTableSorts = useSetRecoilState(tableSortsState);

  const setTableColumns = useSetRecoilState(tableColumnsState);

  const setOnColumnsChange = useSetRecoilState(onColumnsChangeState);

  const setOnToggleColumnFilter = useSetRecoilState(onToggleColumnFilterState);
  const setOnToggleColumnSort = useSetRecoilState(onToggleColumnSortState);

  const setIsRecordTableInitialLoading = useSetRecoilState(
    isRecordTableInitialLoadingState,
  );

  const setRecordTableLastRowVisible = useSetRecoilState(
    tableLastRowVisibleState,
  );

  const onColumnsChange = useRecoilCallback(
    ({ snapshot }) =>
      (columns: ColumnDefinition<FieldMetadata>[]) => {
        const onColumnsChange = getSnapshotValue(
          snapshot,
          onColumnsChangeState,
        );

        onColumnsChange?.(columns);
      },
    [onColumnsChangeState],
  );

  const onEntityCountChange = useRecoilCallback(
    ({ snapshot }) =>
      (count?: number) => {
        const onEntityCountChange = getSnapshotValue(
          snapshot,
          onEntityCountChangeState,
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

  const setRowSelected = useSetRowSelectedState(recordTableId);

  const setHasUserSelectedAllRows = useSetHasUserSelectedAllRows(recordTableId);

  const resetTableRowSelection = useResetTableRowSelection(recordTableId);

  const upsertRecordTableItem = useUpsertRecordFromState;

  const setSoftFocusPosition = useSetSoftFocusPosition(recordTableId);

  const { moveDown, moveLeft, moveRight, moveUp } =
    useRecordTableMoveFocus(recordTableId);

  const useMapKeyboardToSoftFocus = () => {
    const disableSoftFocus = useDisableSoftFocus(recordTableId);
    const setHotkeyScope = useSetHotkeyScope();

    const setIsSoftFocusUsingMouseState = useSetRecoilState(
      isSoftFocusUsingMouseState,
    );

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
        setIsSoftFocusUsingMouseState(false);
      },
      TableHotkeyScope.TableSoftFocus,
      [moveLeft],
    );

    useScopedHotkeys(
      [Key.ArrowRight, Key.Tab],
      () => {
        moveRight();
        setIsSoftFocusUsingMouseState(false);
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

  const setPendingRecordId = useSetRecoilState(pendingRecordIdState);

  return {
    scopeId,
    onColumnsChange,
    setAvailableTableColumns,
    setTableFilters,
    setTableSorts,
    setOnEntityCountChange,
    setRecordTableData,
    setTableColumns,
    leaveTableFocus,
    setRowSelected,
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
    setHasUserSelectedAllRows,
    setOnToggleColumnFilter,
    setOnToggleColumnSort,
    setPendingRecordId,
    hasUserSelectedAllRowsState,
  };
};
