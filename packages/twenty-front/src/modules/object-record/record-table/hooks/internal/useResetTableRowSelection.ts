import { useRecoilCallback } from 'recoil';

import { getActionMenuDropdownIdFromActionMenuId } from '@/action-menu/utils/getActionMenuDropdownIdFromActionMenuId';
import { getActionMenuIdFromRecordIndexId } from '@/action-menu/utils/getActionMenuIdFromRecordIndexId';
import { useTableRowIds } from '@/object-record/record-table/hooks/internal/useTableRowIds';
import { hasUserSelectedAllRowsComponentState } from '@/object-record/record-table/record-table-row/states/hasUserSelectedAllRowsFamilyState';
import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';

export const useResetTableRowSelection = (recordTableId?: string) => {
  const recordTableIdFromContext = useAvailableComponentInstanceIdOrThrow(
    RecordTableComponentInstanceContext,
    recordTableId,
  );

  const isRowSelectedFamilyState = useRecoilComponentCallbackStateV2(
    isRowSelectedComponentFamilyState,
    recordTableIdFromContext,
  );

  const hasUserSelectedAllRowsState = useRecoilComponentCallbackStateV2(
    hasUserSelectedAllRowsComponentState,
    recordTableIdFromContext,
  );

  const isActionMenuDropdownOpenState = extractComponentState(
    isDropdownOpenComponentState,
    getActionMenuDropdownIdFromActionMenuId(
      getActionMenuIdFromRecordIndexId(recordTableIdFromContext),
    ),
  );

  return useRecoilCallback(
    ({ set }) =>
      () => {
        const tableRowIds = getTableRowIds();

        for (const rowId of tableRowIds) {
          set(isRowSelectedFamilyState(rowId), false);
        }

        set(hasUserSelectedAllRowsState, false);

        set(isActionMenuDropdownOpenState, false);
      },
    [
      getTableRowIds,
      hasUserSelectedAllRowsState,
      isActionMenuDropdownOpenState,
      isRowSelectedFamilyState,
    ],
  );
};
