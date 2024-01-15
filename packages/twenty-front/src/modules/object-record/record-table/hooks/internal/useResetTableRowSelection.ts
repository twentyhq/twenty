import { useRecoilCallback } from 'recoil';

import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';

export const useResetTableRowSelection = (recordTableId?: string) => {
  const { getTableRowIdsState, isRowSelectedFamilyState } =
    useRecordTableStates(recordTableId);

  return useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        const tableRowIds = getSnapshotValue(snapshot, getTableRowIdsState());

        for (const rowId of tableRowIds) {
          set(isRowSelectedFamilyState(rowId), false);
        }
      },
    [getTableRowIdsState, isRowSelectedFamilyState],
  );
};
