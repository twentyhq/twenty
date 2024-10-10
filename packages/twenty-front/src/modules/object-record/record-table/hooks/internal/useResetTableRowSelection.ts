import { useRecoilCallback } from 'recoil';

import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';

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

        const isActionMenuDropdownOpenState = extractComponentState(
          isDropdownOpenComponentState,
          `action-menu-dropdown-${recordTableId}`,
        );

        set(isActionMenuDropdownOpenState, false);
      },
    [
      tableRowIdsState,
      hasUserSelectedAllRowsState,
      recordTableId,
      isRowSelectedFamilyState,
    ],
  );
};
