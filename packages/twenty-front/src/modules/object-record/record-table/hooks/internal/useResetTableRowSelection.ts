import { useCallback } from 'react';
import { useStore } from 'jotai';

import { getActionMenuDropdownIdFromActionMenuId } from '@/action-menu/utils/getActionMenuDropdownIdFromActionMenuId';
import { getActionMenuIdFromRecordIndexId } from '@/action-menu/utils/getActionMenuIdFromRecordIndexId';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { hasUserSelectedAllRowsComponentState } from '@/object-record/record-table/record-table-row/states/hasUserSelectedAllRowsFamilyState';
import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { lastSelectedRowIndexComponentState } from '@/object-record/record-table/record-table-row/states/lastSelectedRowIndexComponentState';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomComponentSelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorCallbackState';

export const useResetTableRowSelection = (recordTableId?: string) => {
  const recordTableIdFromContext = useAvailableComponentInstanceIdOrThrow(
    RecordTableComponentInstanceContext,
    recordTableId,
  );

  const recordIndexAllRecordIds = useAtomComponentSelectorCallbackState(
    recordIndexAllRecordIdsComponentSelector,
    recordTableIdFromContext,
  );

  const isRowSelectedFamilyState = useAtomComponentFamilyStateCallbackState(
    isRowSelectedComponentFamilyState,
    recordTableIdFromContext,
  );

  const hasUserSelectedAllRows = useAtomComponentStateCallbackState(
    hasUserSelectedAllRowsComponentState,
    recordTableIdFromContext,
  );

  const lastSelectedRowIndexComponentCallbackState =
    useAtomComponentStateCallbackState(
      lastSelectedRowIndexComponentState,
      recordTableIdFromContext,
    );

  const { closeDropdown } = useCloseDropdown();
  const store = useStore();

  const resetTableRowSelection = useCallback(() => {
    const allRecordIds = store.get(recordIndexAllRecordIds);

    for (const recordId of allRecordIds) {
      store.set(isRowSelectedFamilyState(recordId), false);
    }

    store.set(hasUserSelectedAllRows, false);
    store.set(lastSelectedRowIndexComponentCallbackState, null);

    closeDropdown(
      getActionMenuDropdownIdFromActionMenuId(
        getActionMenuIdFromRecordIndexId(recordTableIdFromContext),
      ),
    );
  }, [
    recordIndexAllRecordIds,
    hasUserSelectedAllRows,
    lastSelectedRowIndexComponentCallbackState,
    isRowSelectedFamilyState,
    closeDropdown,
    recordTableIdFromContext,
    store,
  ]);

  return {
    resetTableRowSelection,
  };
};
