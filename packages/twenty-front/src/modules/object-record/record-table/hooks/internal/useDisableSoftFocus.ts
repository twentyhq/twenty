import { useRecoilCallback } from 'recoil';

import { isSoftFocusActiveScopedState } from '../../states/isSoftFocusActiveScopedState';
import { isSoftFocusOnTableCellScopedFamilyState } from '../../states/isSoftFocusOnTableCellScopedFamilyState';
import { softFocusPositionScopedState } from '../../states/softFocusPositionScopedState';
import { useRecordTableScopedStates } from '@/object-record/record-table/hooks/internal/useRecordTableScopedStates';
import { getRecordTableScopeInjector } from '@/object-record/record-table/utils/getRecordTableScopeInjector';

export const useDisableSoftFocus = ((
  recordTableScopeId: string,
) => {
  const { currentTableCellInEditModePositionScopeInjector } =
    getRecordTableScopeInjector();

  const { injectSnapshotValueWithRecordTableScopeId } =
    useRecordTableScopedStates(recordTableScopeId);

  useRecoilCallback(({ set, snapshot }) => {
    return () => {
      const currentPosition = snapshot
        .getLoadable(softFocusPositionScopedState)
        .valueOrThrow();

      set(isSoftFocusActiveScopedState, false);

      set(isSoftFocusOnTableCellScopedFamilyState(currentPosition), false);
    };
  }, []);
}
