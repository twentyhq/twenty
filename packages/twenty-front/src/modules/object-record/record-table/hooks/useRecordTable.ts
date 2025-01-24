import { useRecoilCallback, useSetRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';

import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { useGetIsSomeCellInEditModeState } from '@/object-record/record-table/hooks/internal/useGetIsSomeCellInEditMode';
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

import { availableTableColumnsComponentState } from '@/object-record/record-table/states/availableTableColumnsComponentState';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { isRecordTableInitialLoadingComponentState } from '@/object-record/record-table/states/isRecordTableInitialLoadingComponentState';
import { onColumnsChangeComponentState } from '@/object-record/record-table/states/onColumnsChangeComponentState';
import { onEntityCountChangeComponentState } from '@/object-record/record-table/states/onEntityCountChangeComponentState';
import { onToggleColumnFilterComponentState } from '@/object-record/record-table/states/onToggleColumnFilterComponentState';
import { onToggleColumnSortComponentState } from '@/object-record/record-table/states/onToggleColumnSortComponentState';
import { tableColumnsComponentState } from '@/object-record/record-table/states/tableColumnsComponentState';
import { tableFiltersComponentState } from '@/object-record/record-table/states/tableFiltersComponentState';
import { tableLastRowVisibleComponentState } from '@/object-record/record-table/states/tableLastRowVisibleComponentState';
import { tableSortsComponentState } from '@/object-record/record-table/states/tableSortsComponentState';
import { tableViewFilterGroupsComponentState } from '@/object-record/record-table/states/tableViewFilterGroupsComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
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
  const recordTableId = useAvailableComponentInstanceIdOrThrow(
    RecordTableComponentInstanceContext,
    props?.recordTableId,
  );

  const availableTableColumnsState = useRecoilComponentCallbackStateV2(
    availableTableColumnsComponentState,
    recordTableId,
  );

  const tableColumnsState = useRecoilComponentCallbackStateV2(
    tableColumnsComponentState,
    recordTableId,
  );

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

  const setTableColumns = useRecoilCallback(
    ({ snapshot, set }) =>
      (columns: ColumnDefinition<FieldMetadata>[]) => {
        const tableColumns = getSnapshotValue(snapshot, tableColumnsState);

        if (isDeeplyEqual(tableColumns, columns)) {
          return;
        }
        set(tableColumnsState, columns);
      },
    [tableColumnsState],
  );

  const setOnEntityCountChange = useSetRecoilComponentStateV2(
    onEntityCountChangeComponentState,
    recordTableId,
  );

  const setTableViewFilterGroups = useSetRecoilComponentStateV2(
    tableViewFilterGroupsComponentState,
    recordTableId,
  );

  const setTableFilters = useSetRecoilComponentStateV2(
    tableFiltersComponentState,
    recordTableId,
  );

  const setTableSorts = useSetRecoilComponentStateV2(
    tableSortsComponentState,
    recordTableId,
  );

  const setOnColumnsChange = useSetRecoilComponentStateV2(
    onColumnsChangeComponentState,
    recordTableId,
  );

  const setOnToggleColumnFilter = useSetRecoilComponentStateV2(
    onToggleColumnFilterComponentState,
    recordTableId,
  );
  const setOnToggleColumnSort = useSetRecoilComponentStateV2(
    onToggleColumnSortComponentState,
    recordTableId,
  );

  const setIsRecordTableInitialLoading = useSetRecoilComponentStateV2(
    isRecordTableInitialLoadingComponentState,
    recordTableId,
  );

  const setRecordTableLastRowVisible = useSetRecoilComponentStateV2(
    tableLastRowVisibleComponentState,
    recordTableId,
  );

  const onColumnsChangeState = useRecoilComponentCallbackStateV2(
    onColumnsChangeComponentState,
    recordTableId,
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

  const onEntityCountChangeState = useRecoilComponentCallbackStateV2(
    onEntityCountChangeComponentState,
    recordTableId,
  );

  const onEntityCountChange = useRecoilCallback(
    ({ snapshot }) =>
      (count?: number, currentRecordGroupId?: string) => {
        const onEntityCountChange = getSnapshotValue(
          snapshot,
          onEntityCountChangeState,
        );

        onEntityCountChange?.(count, currentRecordGroupId);
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

  return {
    onColumnsChange,
    setAvailableTableColumns,
    setTableViewFilterGroups,
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
    setHasUserSelectedAllRows,
    setOnToggleColumnFilter,
    setOnToggleColumnSort,
  };
};
