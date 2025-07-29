import { useRecoilCallback } from 'recoil';

import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { useResetTableRowSelection } from '@/object-record/record-table/hooks/internal/useResetTableRowSelection';
import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { allRowsSelectedStatusComponentSelector } from '@/object-record/record-table/states/selectors/allRowsSelectedStatusComponentSelector';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';

export const useSelectAllRows = (recordTableId?: string) => {
  const allRowsSelectedStatusSelector = useRecoilComponentCallbackStateV2(
    allRowsSelectedStatusComponentSelector,
    recordTableId,
  );
  const isRowSelectedFamilyState = useRecoilComponentCallbackStateV2(
    isRowSelectedComponentFamilyState,
    recordTableId,
  );
  const recordIndexAllRecordIdsSelector = useRecoilComponentCallbackStateV2(
    recordIndexAllRecordIdsComponentSelector,
    recordTableId,
  );

  const resetTableRowSelection = useResetTableRowSelection(recordTableId);

  const selectAllRows = useRecoilCallback(
    ({ set, snapshot }) =>
      () => {
        const allRowsSelectedStatus = getSnapshotValue(
          snapshot,
          allRowsSelectedStatusSelector,
        );

        const allRecordIds = getSnapshotValue(
          snapshot,
          recordIndexAllRecordIdsSelector,
        );

        if (allRowsSelectedStatus === 'all') {
          resetTableRowSelection();
        }

        for (const recordId of allRecordIds) {
          const isSelected =
            allRowsSelectedStatus === 'none' ||
            allRowsSelectedStatus === 'some';

          set(isRowSelectedFamilyState(recordId), isSelected);
        }
      },
    [
      allRowsSelectedStatusSelector,
      recordIndexAllRecordIdsSelector,
      resetTableRowSelection,
      isRowSelectedFamilyState,
    ],
  );

  return {
    selectAllRows,
  };
};
