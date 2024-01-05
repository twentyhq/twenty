import { useRecoilCallback } from 'recoil';

import { useRecordTableScopedStates } from '@/object-record/record-table/hooks/internal/useRecordTableScopedStates';
import { getRecordTableScopeInjector } from '@/object-record/record-table/utils/getRecordTableScopeInjector';

export const useDisableSoftFocus = (recordTableScopeId: string) => {
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
      return () => {
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

        set(isSoftFocusActiveState, false);

        set(isSoftFocusOnTableCellFamilyState(currentPosition), false);
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
