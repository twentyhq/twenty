import { useRecoilCallback } from 'recoil';

import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';

export const useResetTableRowSelection = (recordTableId?: string) => {
  const {
    tableRowIdsState,
    isRowSelectedFamilyState,
    hasUserSelectedAllRowsState,
  } = useRecordTableStates(recordTableId);

  return useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        const tableRowIds = getSnapshotValue(snapshot, tableRowIdsState);

        for (const rowId of tableRowIds) {
          set(isRowSelectedFamilyState(rowId), false);
        }

        set(hasUserSelectedAllRowsState, false);
      },
    [tableRowIdsState, isRowSelectedFamilyState, hasUserSelectedAllRowsState],
  );
};
