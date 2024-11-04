import { useRecoilCallback } from 'recoil';

import { useCurrentRecordGroup } from '@/object-record/record-group/hooks/useCurrentRecordGroup';
import { useTableRowIds } from '@/object-record/record-table/hooks/internal/useTableRowIds';
import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { allRowsSelectedStatusComponentSelector } from '@/object-record/record-table/states/selectors/allRowsSelectedStatusComponentSelector';
import { tableRowIdsByGroupComponentFamilyState } from '@/object-record/record-table/states/tableRowIdsByGroupComponentFamilyState';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';

export const useSelectAllRows = (recordTableId?: string) => {
  const recordGroup = useCurrentRecordGroup({
    recordTableId,
  });

  const allRowsSelectedStatusSelector = useRecoilComponentCallbackStateV2(
    allRowsSelectedStatusComponentSelector,
    recordTableId,
  );
  const tableRowIdsState = useRecoilComponentCallbackStateV2(
    tableRowIdsByGroupComponentFamilyState,
    recordTableId,
  );
  const isRowSelectedFamilyState = useRecoilComponentCallbackStateV2(
    isRowSelectedComponentFamilyState,
    recordTableId,
  );

  const getTableRowIds = useTableRowIds();

  const selectAllRows = useRecoilCallback(
    ({ set, snapshot }) =>
      () => {
        const allRowsSelectedStatus = getSnapshotValue(
          snapshot,
          allRowsSelectedStatusSelector(recordGroup.id),
        );

        const tableRowIds = getTableRowIds();

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
      allRowsSelectedStatusSelector,
      recordGroup.id,
      getTableRowIds,
      isRowSelectedFamilyState,
    ],
  );

  return {
    selectAllRows,
  };
};
