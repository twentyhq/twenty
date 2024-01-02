import { useRecoilCallback } from 'recoil';

import { useRecordTableScopedStates } from '@/object-record/record-table/hooks/internal/useRecordTableScopedStates';
import { getRecordTableScopeInjector } from '@/object-record/record-table/utils/getRecordTableScopeInjector';

import { TableCellPosition } from '../../types/TableCellPosition';

export const useMoveEditModeToTableCellPosition = (
  recordTableScopeId: string,
) => {
  const {
    isTableCellInEditModeScopeInjector,
    currentTableCellInEditModePositionScopeInjector,
  } = getRecordTableScopeInjector();

  const {
    injectStateWithRecordTableScopeId,
    injectSnapshotValueWithRecordTableScopeId,
    injectFamilyStateWithRecordTableScopeId,
  } = useRecordTableScopedStates(recordTableScopeId);

  return useRecoilCallback(
    ({ set, snapshot }) => {
      return (newPosition: TableCellPosition) => {
        const currentTableCellInEditModePosition =
          injectSnapshotValueWithRecordTableScopeId(
            snapshot,
            currentTableCellInEditModePositionScopeInjector,
          );

        const currentTableCellInEditModePositionState =
          injectStateWithRecordTableScopeId(
            currentTableCellInEditModePositionScopeInjector,
          );

        const isTableCellInEditModeFamilyState =
          injectFamilyStateWithRecordTableScopeId(
            isTableCellInEditModeScopeInjector,
          );

        set(
          isTableCellInEditModeFamilyState(currentTableCellInEditModePosition),
          false,
        );

        set(currentTableCellInEditModePositionState, newPosition);

        set(isTableCellInEditModeFamilyState(newPosition), true);
      };
    },
    [
      currentTableCellInEditModePositionScopeInjector,
      injectFamilyStateWithRecordTableScopeId,
      injectSnapshotValueWithRecordTableScopeId,
      injectStateWithRecordTableScopeId,
      isTableCellInEditModeScopeInjector,
    ],
  );
};
