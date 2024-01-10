import { useRecoilCallback } from 'recoil';

import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';

export const useResetTableRowSelection = (recordTableScopeId: string) => {
  const { tableRowIdsState, isRowSelectedFamilyState } =
    useRecordTableStates(recordTableScopeId);

  return useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        const tableRowIds = getSnapshotValue(snapshot, tableRowIdsState);

        for (const rowId of tableRowIds) {
          set(isRowSelectedFamilyState(rowId), false);
        }
      },
    [isRowSelectedFamilyState, tableRowIdsState],
  );
};
