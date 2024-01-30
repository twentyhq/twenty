import { useRecoilCallback, useSetRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';

import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { useGetIsSomeCellInEditModeState } from '@/object-record/record-table/hooks/internal/useGetIsSomeCellInEditMode';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { useRecordTableMoveFocus } from '@/object-record/record-table/hooks/useRecordTableMoveFocus';
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
    getAvailableTableColumnsState,
    getTableFiltersState,
    getTableSortsState,
    getTableColumnsState,
    getOnEntityCountChangeState,
    getOnColumnsChangeState,
    getIsRecordTableInitialLoadingState,
    getTableLastRowVisibleState,
    getSelectedRowIdsSelector,
  } = useRecordTableStates(recordTableId);

  const setAvailableTableColumns = useRecoilCallback(
    ({ snapshot, set }) =>
      (columns: ColumnDefinition<FieldMetadata>[]) => {
        const availableTableColumnsState = getSnapshotValue(
          snapshot,
          getAvailableTableColumnsState(),
        );

        if (isDeeplyEqual(availableTableColumnsState, columns)) {
          return;
        }
        set(getAvailableTableColumnsState(), columns);
      },
    [getAvailableTableColumnsState],
  );

  const setOnEntityCountChange = useSetRecoilState(
    getOnEntityCountChangeState(),
  );

  const setTableFilters = useSetRecoilState(getTableFiltersState());

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

  const { moveDown, moveLeft, moveRight, moveUp } =
    useRecordTableMoveFocus(recordTableId);

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
    getSelectedRowIdsSelector,
  };
};
