import { useRecoilCallback } from 'recoil';

import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { useResetTableRowSelection } from '@/object-record/record-table/hooks/internal/useResetTableRowSelection';
import { hasUserSelectedAllRowsComponentState } from '@/object-record/record-table/record-table-row/states/hasUserSelectedAllRowsFamilyState';
import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { allRowsSelectedStatusComponentSelector } from '@/object-record/record-table/states/selectors/allRowsSelectedStatusComponentSelector';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';

export const useSelectAllRows = (recordTableId?: string) => {
  const hasUserSelectedAllRowsCallbackState = useRecoilComponentCallbackState(
    hasUserSelectedAllRowsComponentState,
    recordTableId,
  );

  const allRowsSelectedStatusSelector = useRecoilComponentCallbackState(
    allRowsSelectedStatusComponentSelector,
    recordTableId,
  );

  const isRowSelectedFamilyState = useRecoilComponentCallbackState(
    isRowSelectedComponentFamilyState,
    recordTableId,
  );
  const recordIndexAllRecordIdsSelector = useRecoilComponentCallbackState(
    recordIndexAllRecordIdsComponentSelector,
    recordTableId,
  );

  const { resetTableRowSelection } = useResetTableRowSelection(recordTableId);

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

        set(hasUserSelectedAllRowsCallbackState, true);
      },
    [
      allRowsSelectedStatusSelector,
      recordIndexAllRecordIdsSelector,
      resetTableRowSelection,
      isRowSelectedFamilyState,
      hasUserSelectedAllRowsCallbackState,
    ],
  );

  return {
    selectAllRows,
  };
};
