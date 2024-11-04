import { useRecoilCallback } from 'recoil';

import { useTableRowIds } from '@/object-record/record-table/hooks/internal/useTableRowIds';
import { hasUserSelectedAllRowsComponentState } from '@/object-record/record-table/record-table-row/states/hasUserSelectedAllRowsFamilyState';
import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';

export const useResetTableRowSelection = (recordTableId?: string) => {
  const isRowSelectedFamilyState = useRecoilComponentCallbackStateV2(
    isRowSelectedComponentFamilyState,
    recordTableId,
  );
  const hasUserSelectedAllRowsState = useRecoilComponentCallbackStateV2(
    hasUserSelectedAllRowsComponentState,
    recordTableId,
  );

  const getTableRowIds = useTableRowIds(recordTableId);

  return useRecoilCallback(
    ({ set }) =>
      () => {
        const tableRowIds = getTableRowIds();

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
      getTableRowIds,
      hasUserSelectedAllRowsState,
      recordTableId,
      isRowSelectedFamilyState,
    ],
  );
};
