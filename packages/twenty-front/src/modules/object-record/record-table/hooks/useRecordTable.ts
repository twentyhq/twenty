import { useRecoilCallback } from 'recoil';
import { Key } from 'ts-key-enum';

import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { useSetHasUserSelectedAllRows } from '@/object-record/record-table/hooks/internal/useSetAllRowSelectedState';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
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

import { useRecordTableMove } from '@/object-record/record-table/hooks/useRecordTableMove';
import { useRecordTableMoveFocusedRow } from '@/object-record/record-table/hooks/useRecordTableMoveFocusedRow';
import { onToggleColumnSortComponentState } from '@/object-record/record-table/states/onToggleColumnSortComponentState';
import { tableLastRowVisibleComponentState } from '@/object-record/record-table/states/tableLastRowVisibleComponentState';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
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

  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();

  const { move } = useRecordTableMove(recordTableId);

  const { moveFocusedRow } = useRecordTableMoveFocusedRow(recordTableId);

  const useMapKeyboardToFocus = () => {
    useScopedHotkeys(
      [Key.ArrowUp, `${Key.Shift}+${Key.Enter}`],
      () => {
        move('up');
      },
      TableHotkeyScope.TableFocus,
      [move],
    );

    useScopedHotkeys(
      Key.ArrowDown,
      () => {
        move('down');
      },
      TableHotkeyScope.TableFocus,
      [move],
    );

    useScopedHotkeys(
      [Key.ArrowUp, 'k'],
      () => {
        setHotkeyScopeAndMemorizePreviousScope(TableHotkeyScope.TableFocus);
        move('up');
      },
      TableHotkeyScope.Table,
      [move],
    );

    useScopedHotkeys(
      [Key.ArrowDown, 'j'],
      () => {
        setHotkeyScopeAndMemorizePreviousScope(TableHotkeyScope.TableFocus);
        move('down');
      },
      TableHotkeyScope.Table,
      [move],
    );

    useScopedHotkeys(
      [Key.ArrowUp, 'k'],
      () => {
        moveFocusedRow('up');
      },
      TableHotkeyScope.TableFocus,
      [moveFocusedRow],
    );

    useScopedHotkeys(
      [Key.ArrowDown, 'j'],
      () => {
        moveFocusedRow('down');
      },
      TableHotkeyScope.TableFocus,
      [moveFocusedRow],
    );

    useScopedHotkeys(
      [Key.ArrowLeft, `${Key.Shift}+${Key.Tab}`],
      () => {
        move('left');
      },
      TableHotkeyScope.TableFocus,
      [move],
    );

    useScopedHotkeys(
      [Key.ArrowRight, Key.Tab],
      () => {
        move('right');
      },
      TableHotkeyScope.TableFocus,
      [move],
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
    move,
    useMapKeyboardToFocus,
    selectAllRows,
    setOnColumnsChange,
    setIsRecordTableInitialLoading,
    setRecordTableLastRowVisible,
    setFocusPosition,
    setHasUserSelectedAllRows,
    setOnToggleColumnSort,
  };
};
