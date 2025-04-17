import { useRecoilCallback } from 'recoil';
import { Key } from 'ts-key-enum';

import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { useSetHasUserSelectedAllRows } from '@/object-record/record-table/hooks/internal/useSetAllRowSelectedState';
import { useRecordTableMoveFocus } from '@/object-record/record-table/hooks/useRecordTableMoveFocus';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { useUpsertRecordFromState } from '../../hooks/useUpsertRecordFromState';
import { ColumnDefinition } from '../types/ColumnDefinition';
import { TableHotkeyScope } from '../types/TableHotkeyScope';

import { useSetIsRecordTableFocusActive } from '@/object-record/record-table/record-table-cell/hooks/useSetIsRecordTableFocusActive';
import { availableTableColumnsComponentState } from '@/object-record/record-table/states/availableTableColumnsComponentState';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { isRecordTableInitialLoadingComponentState } from '@/object-record/record-table/states/isRecordTableInitialLoadingComponentState';
import { onColumnsChangeComponentState } from '@/object-record/record-table/states/onColumnsChangeComponentState';
import { onEntityCountChangeComponentState } from '@/object-record/record-table/states/onEntityCountChangeComponentState';
import { onToggleColumnFilterComponentState } from '@/object-record/record-table/states/onToggleColumnFilterComponentState';
import { onToggleColumnSortComponentState } from '@/object-record/record-table/states/onToggleColumnSortComponentState';
import { tableLastRowVisibleComponentState } from '@/object-record/record-table/states/tableLastRowVisibleComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useLeaveTableFocus } from './internal/useLeaveTableFocus';
import { useResetTableRowSelection } from './internal/useResetTableRowSelection';
import { useSelectAllRows } from './internal/useSelectAllRows';
import { useSetRecordTableData } from './internal/useSetRecordTableData';
import { useSetRecordTableFocusPosition } from './internal/useSetRecordTableFocusPosition';
import { useSetRowSelectedState } from './internal/useSetRowSelectedState';

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

  const setOnEntityCountChange = useSetRecoilComponentStateV2(
    onEntityCountChangeComponentState,
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

  const setFocusPosition = useSetRecordTableFocusPosition(recordTableId);

  const { setIsFocusActiveForCurrentPosition } =
    useSetIsRecordTableFocusActive(recordTableId);

  const { moveDown, moveLeft, moveRight, moveUp } =
    useRecordTableMoveFocus(recordTableId);

  const useMapKeyboardToFocus = () => {
    const setHotkeyScope = useSetHotkeyScope();

    useScopedHotkeys(
      [Key.ArrowUp, `${Key.Shift}+${Key.Enter}`],
      () => {
        moveUp();
      },
      TableHotkeyScope.TableFocus,
      [moveUp],
    );

    useScopedHotkeys(
      Key.ArrowDown,
      () => {
        moveDown();
      },
      TableHotkeyScope.TableFocus,
      [moveDown],
    );

    useScopedHotkeys(
      [Key.ArrowLeft, `${Key.Shift}+${Key.Tab}`],
      () => {
        moveLeft();
      },
      TableHotkeyScope.TableFocus,
      [moveLeft],
    );

    useScopedHotkeys(
      [Key.ArrowRight, Key.Tab],
      () => {
        moveRight();
      },
      TableHotkeyScope.TableFocus,
      [moveRight],
    );

    useScopedHotkeys(
      [Key.Escape],
      () => {
        setHotkeyScope(TableHotkeyScope.Table, {
          goto: true,
          keyboardShortcutMenu: true,
        });
        setIsFocusActiveForCurrentPosition(false);
      },
      TableHotkeyScope.TableFocus,
      [setIsFocusActiveForCurrentPosition],
    );
  };

  const { selectAllRows } = useSelectAllRows(recordTableId);

  return {
    onColumnsChange,
    setAvailableTableColumns,
    setOnEntityCountChange,
    setRecordTableData,
    leaveTableFocus,
    setRowSelected,
    resetTableRowSelection,
    upsertRecordTableItem,
    moveDown,
    moveLeft,
    moveRight,
    moveUp,
    useMapKeyboardToFocus,
    selectAllRows,
    setOnColumnsChange,
    setIsRecordTableInitialLoading,
    setRecordTableLastRowVisible,
    setFocusPosition,
    setHasUserSelectedAllRows,
    setOnToggleColumnFilter,
    setOnToggleColumnSort,
  };
};
