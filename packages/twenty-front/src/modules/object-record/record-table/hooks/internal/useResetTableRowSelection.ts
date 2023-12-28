import { useRecoilCallback } from 'recoil';

import { useRecordTableScopedStates } from '@/object-record/record-table/hooks/internal/useRecordTableScopedStates';
import { getRecordTableScopeInjector } from '@/object-record/record-table/utils/getRecordTableScopeInjector';

export const useResetTableRowSelection = (recordTableScopeId: string) => {
  const { tableRowIdsScopeInjector, isRowSelectedScopeInjector } =
    getRecordTableScopeInjector();

  const {
    injectSnapshotValueWithRecordTableScopeId,
    injectFamilyStateWithRecordTableScopeId,
  } = useRecordTableScopedStates(recordTableScopeId);

  return useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        const tableRowIds = injectSnapshotValueWithRecordTableScopeId(
          snapshot,
          tableRowIdsScopeInjector,
        );

        const isRowSelectedFamilyState =
          injectFamilyStateWithRecordTableScopeId(isRowSelectedScopeInjector);

        for (const rowId of tableRowIds) {
          set(isRowSelectedFamilyState(rowId), false);
        }
      },
    [
      injectFamilyStateWithRecordTableScopeId,
      injectSnapshotValueWithRecordTableScopeId,
      isRowSelectedScopeInjector,
      tableRowIdsScopeInjector,
    ],
  );
};
