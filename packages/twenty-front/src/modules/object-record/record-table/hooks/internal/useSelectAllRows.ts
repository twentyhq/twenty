import { useRecoilCallback } from 'recoil';

import { useRecordTableScopedStates } from '@/object-record/record-table/hooks/internal/useRecordTableScopedStates';
import { getRecordTableScopeInjector } from '@/object-record/record-table/utils/getRecordTableScopeInjector';

export const useSelectAllRows = (recordTableScopeId: string) => {
  const {
    allRowsSelectedStatusScopeInjector,
    tableRowIdsScopeInjector,
    isRowSelectedScopeInjector,
  } = getRecordTableScopeInjector();

  const {
    injectSnapshotValueWithRecordTableScopeId,
    injectSelectorSnapshotValueWithRecordTableScopeId,
    injectFamilyStateWithRecordTableScopeId,
  } = useRecordTableScopedStates(recordTableScopeId);

  const selectAllRows = useRecoilCallback(
    ({ set, snapshot }) =>
      () => {
        const allRowsSelectedStatus =
          injectSelectorSnapshotValueWithRecordTableScopeId(
            snapshot,
            allRowsSelectedStatusScopeInjector,
          );

        const tableRowIds = injectSnapshotValueWithRecordTableScopeId(
          snapshot,
          tableRowIdsScopeInjector,
        );

        const isRowSelectedFamilyState =
          injectFamilyStateWithRecordTableScopeId(isRowSelectedScopeInjector);

        if (
          allRowsSelectedStatus === 'none' ||
          allRowsSelectedStatus === 'some'
        ) {
          for (const rowId of tableRowIds) {
            set(isRowSelectedFamilyState(rowId), true);
          }
        } else {
          for (const rowId of tableRowIds) {
            set(isRowSelectedFamilyState(rowId), false);
          }
        }
      },
    [
      allRowsSelectedStatusScopeInjector,
      injectFamilyStateWithRecordTableScopeId,
      injectSelectorSnapshotValueWithRecordTableScopeId,
      injectSnapshotValueWithRecordTableScopeId,
      isRowSelectedScopeInjector,
      tableRowIdsScopeInjector,
    ],
  );

  return {
    selectAllRows,
  };
};
