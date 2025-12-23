import { useRecoilCallback } from 'recoil';

import { getActionMenuDropdownIdFromActionMenuId } from '@/action-menu/utils/getActionMenuDropdownIdFromActionMenuId';
import { getActionMenuIdFromRecordIndexId } from '@/action-menu/utils/getActionMenuIdFromRecordIndexId';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { hasUserSelectedAllRowsComponentState } from '@/object-record/record-table/record-table-row/states/hasUserSelectedAllRowsFamilyState';
import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { lastSelectedRowIndexComponentState } from '@/object-record/record-table/record-table-row/states/lastSelectedRowIndexComponentState';

export const useResetTableRowSelection = (recordTableId?: string) => {
  const recordTableIdFromContext = useAvailableComponentInstanceIdOrThrow(
    RecordTableComponentInstanceContext,
    recordTableId,
  );

  const recordIndexAllRecordIdsSelector = useRecoilComponentCallbackState(
    recordIndexAllRecordIdsComponentSelector,
    recordTableIdFromContext,
  );

  const isRowSelectedFamilyState = useRecoilComponentCallbackState(
    isRowSelectedComponentFamilyState,
    recordTableIdFromContext,
  );

  const hasUserSelectedAllRowsState = useRecoilComponentCallbackState(
    hasUserSelectedAllRowsComponentState,
    recordTableIdFromContext,
  );

  const lastSelectedRowIndexComponentCallbackState =
    useRecoilComponentCallbackState(
      lastSelectedRowIndexComponentState,
      recordTableIdFromContext,
    );

  const { closeDropdown } = useCloseDropdown();

  const resetTableRowSelection = useRecoilCallback(
    ({ set, snapshot }) =>
      () => {
        const allRecordIds = getSnapshotValue(
          snapshot,
          recordIndexAllRecordIdsSelector,
        );

        for (const recordId of allRecordIds) {
          set(isRowSelectedFamilyState(recordId), false);
        }

        set(hasUserSelectedAllRowsState, false);

        set(lastSelectedRowIndexComponentCallbackState, null);

        closeDropdown(
          getActionMenuDropdownIdFromActionMenuId(
            getActionMenuIdFromRecordIndexId(recordTableIdFromContext),
          ),
        );
      },
    [
      recordIndexAllRecordIdsSelector,
      hasUserSelectedAllRowsState,
      lastSelectedRowIndexComponentCallbackState,
      isRowSelectedFamilyState,
      closeDropdown,
      recordTableIdFromContext,
    ],
  );

  return {
    resetTableRowSelection,
  };
};
