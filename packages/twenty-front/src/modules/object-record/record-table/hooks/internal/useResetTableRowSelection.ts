import { useRecoilCallback } from 'recoil';

import { getActionMenuDropdownIdFromActionMenuId } from '@/action-menu/utils/getActionMenuDropdownIdFromActionMenuId';
import { getActionMenuIdFromRecordIndexId } from '@/action-menu/utils/getActionMenuIdFromRecordIndexId';
import { hasUserSelectedAllRowsComponentState } from '@/object-record/record-table/record-table-row/states/hasUserSelectedAllRowsFamilyState';
import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { tableAllRowIdsComponentState } from '@/object-record/record-table/states/tableAllRowIdsComponentState';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';

export const useResetTableRowSelection = (recordTableId?: string) => {
  const recordTableIdFromContext = useAvailableComponentInstanceIdOrThrow(
    RecordTableComponentInstanceContext,
    recordTableId,
  );

  const tableAllRowIdsState = useRecoilComponentCallbackStateV2(
    tableAllRowIdsComponentState,
    recordTableIdFromContext,
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
    ({ set, snapshot }) =>
      () => {
        const tableRowIds = getSnapshotValue(snapshot, tableAllRowIdsState);

        for (const rowId of tableRowIds) {
          set(isRowSelectedFamilyState(rowId), false);
        }

        set(hasUserSelectedAllRowsState, false);

        set(isActionMenuDropdownOpenState, false);
      },
    [
      tableAllRowIdsState,
      hasUserSelectedAllRowsState,
      isActionMenuDropdownOpenState,
      isRowSelectedFamilyState,
    ],
  );
};
