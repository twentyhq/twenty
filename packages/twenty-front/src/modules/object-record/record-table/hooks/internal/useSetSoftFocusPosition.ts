import { useRecoilCallback } from 'recoil';

import { useRecordTableScopedStates } from '@/object-record/record-table/hooks/internal/useRecordTableScopedStates';
import { getRecordTableScopeInjector } from '@/object-record/record-table/utils/getRecordTableScopeInjector';

import { TableCellPosition } from '../../types/TableCellPosition';

export const useSetSoftFocusPosition = (recordTableScopeId: string) => {
  const {
    softFocusPositionScopeInjector,
    isSoftFocusActiveScopeInjector,
    isSoftFocusOnTableCellScopeInjector,
  } = getRecordTableScopeInjector();

  const {
    injectStateWithRecordTableScopeId,
    injectSnapshotValueWithRecordTableScopeId,
    injectFamilyStateWithRecordTableScopeId,
  } = useRecordTableScopedStates(recordTableScopeId);

  return useRecoilCallback(
    ({ set, snapshot }) => {
      return (newPosition: TableCellPosition) => {
        const currentPosition = injectSnapshotValueWithRecordTableScopeId(
          snapshot,
          softFocusPositionScopeInjector,
        );

        const isSoftFocusActiveState = injectStateWithRecordTableScopeId(
          isSoftFocusActiveScopeInjector,
        );

        const isSoftFocusOnTableCellFamilyState =
          injectFamilyStateWithRecordTableScopeId(
            isSoftFocusOnTableCellScopeInjector,
          );

        const softFocusPositionState = injectStateWithRecordTableScopeId(
          softFocusPositionScopeInjector,
        );

        set(isSoftFocusActiveState, true);

        set(isSoftFocusOnTableCellFamilyState(currentPosition), false);

        set(softFocusPositionState, newPosition);

        set(isSoftFocusOnTableCellFamilyState(newPosition), true);
      };
    },
    [
      injectFamilyStateWithRecordTableScopeId,
      injectSnapshotValueWithRecordTableScopeId,
      injectStateWithRecordTableScopeId,
      isSoftFocusActiveScopeInjector,
      isSoftFocusOnTableCellScopeInjector,
      softFocusPositionScopeInjector,
    ],
  );
};
