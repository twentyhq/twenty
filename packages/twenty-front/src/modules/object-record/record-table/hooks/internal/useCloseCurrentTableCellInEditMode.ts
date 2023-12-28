import { useRecoilCallback } from 'recoil';

import { useRecordTableScopedStates } from '@/object-record/record-table/hooks/internal/useRecordTableScopedStates';
import { getRecordTableScopeInjector } from '@/object-record/record-table/utils/getRecordTableScopeInjector';

import { isTableCellInEditModeScopedFamilyState } from '../../states/isTableCellInEditModeScopedFamilyState';

export const useCloseCurrentTableCellInEditMode = (
  recordTableScopeId: string,
) => {
  const { currentTableCellInEditModePositionScopeInjector } =
    getRecordTableScopeInjector();

  const { injectSnapshotValueWithRecordTableScopeId } =
    useRecordTableScopedStates(recordTableScopeId);

  return useRecoilCallback(
    ({ set, snapshot }) => {
      return async () => {
        const currentTableCellInEditModePosition =
          injectSnapshotValueWithRecordTableScopeId(
            snapshot,
            currentTableCellInEditModePositionScopeInjector,
          );

        set(
          isTableCellInEditModeScopedFamilyState({
            scopeId: recordTableScopeId,
            familyKey: currentTableCellInEditModePosition,
          }),
          false,
        );
      };
    },
    [
      currentTableCellInEditModePositionScopeInjector,
      injectSnapshotValueWithRecordTableScopeId,
      recordTableScopeId,
    ],
  );
};
