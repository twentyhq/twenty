import { useRecoilCallback } from 'recoil';

import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { useSetHasUserSelectedAllRows } from '@/object-record/record-table/hooks/internal/useSetAllRowSelectedState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { ColumnDefinition } from '../types/ColumnDefinition';

import { availableTableColumnsComponentState } from '@/object-record/record-table/states/availableTableColumnsComponentState';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { isRecordTableInitialLoadingComponentState } from '@/object-record/record-table/states/isRecordTableInitialLoadingComponentState';
import { onColumnsChangeComponentState } from '@/object-record/record-table/states/onColumnsChangeComponentState';

import { onToggleColumnSortComponentState } from '@/object-record/record-table/states/onToggleColumnSortComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useLeaveTableFocus } from './internal/useLeaveTableFocus';
import { useResetTableRowSelection } from './internal/useResetTableRowSelection';
import { useSelectAllRows } from './internal/useSelectAllRows';
import { useSetRowSelectedState } from './internal/useSetRowSelectedState';
type useRecordTableProps = {
  recordTableId?: string;
};

export const useRecordTable = (props?: useRecordTableProps) => {
  const recordTableId = useAvailableComponentInstanceIdOrThrow(
    RecordTableComponentInstanceContext,
    props?.recordTableId,
  );

  const availableTableColumnsState = useRecoilComponentCallbackState(
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

  const setOnColumnsChange = useSetRecoilComponentState(
    onColumnsChangeComponentState,
    recordTableId,
  );

  const setOnToggleColumnSort = useSetRecoilComponentState(
    onToggleColumnSortComponentState,
    recordTableId,
  );

  const setIsRecordTableInitialLoading = useSetRecoilComponentState(
    isRecordTableInitialLoadingComponentState,
    recordTableId,
  );

  const onColumnsChangeState = useRecoilComponentCallbackState(
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

  const leaveTableFocus = useLeaveTableFocus(recordTableId);

  const setRowSelected = useSetRowSelectedState(recordTableId);

  const setHasUserSelectedAllRows = useSetHasUserSelectedAllRows(recordTableId);

  const resetTableRowSelection = useResetTableRowSelection(recordTableId);

  const { selectAllRows } = useSelectAllRows(recordTableId);

  return {
    onColumnsChange,
    setAvailableTableColumns,
    leaveTableFocus,
    setRowSelected,
    resetTableRowSelection,
    selectAllRows,
    setOnColumnsChange,
    setIsRecordTableInitialLoading,
    setHasUserSelectedAllRows,
    setOnToggleColumnSort,
  };
};
