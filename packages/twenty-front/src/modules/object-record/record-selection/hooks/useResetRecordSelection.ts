import { useStore } from 'jotai';
import { useCallback } from 'react';

import { getCommandMenuDropdownIdFromCommandMenuId } from '@/command-menu-item/utils/getCommandMenuDropdownIdFromCommandMenuId';
import { getCommandMenuIdFromRecordIndexId } from '@/command-menu-item/utils/getCommandMenuIdFromRecordIndexId';
import { RecordSelectionComponentInstanceContext } from '@/object-record/record-selection/states/contexts/RecordSelectionComponentInstanceContext';
import { hasUserSelectedAllRecordsComponentState } from '@/object-record/record-selection/states/hasUserSelectedAllRecordsComponentState';
import { isRecordSelectedComponentFamilyState } from '@/object-record/record-selection/states/isRecordSelectedComponentFamilyState';
import { recordSelectionRangeComponentState } from '@/object-record/record-selection/states/recordSelectionRangeComponentState';
import { selectedRecordIdsComponentSelector } from '@/object-record/record-selection/states/selectors/selectedRecordIdsComponentSelector';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomComponentSelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorCallbackState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';

export const useResetRecordSelection = (recordIndexId?: string) => {
  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordSelectionComponentInstanceContext,
    recordIndexId,
  );

  const isRecordSelectedFamilyState = useAtomComponentFamilyStateCallbackState(
    isRecordSelectedComponentFamilyState,
    instanceId,
  );

  const selectedRecordIds = useAtomComponentSelectorCallbackState(
    selectedRecordIdsComponentSelector,
    instanceId,
  );

  const hasUserSelectedAllRecords = useAtomComponentStateCallbackState(
    hasUserSelectedAllRecordsComponentState,
    instanceId,
  );

  const recordSelectionRange = useAtomComponentStateCallbackState(
    recordSelectionRangeComponentState,
    instanceId,
  );

  const { closeDropdown } = useCloseDropdown();
  const store = useStore();

  const resetRecordSelection = useCallback(() => {
    for (const recordId of store.get(selectedRecordIds)) {
      store.set(isRecordSelectedFamilyState(recordId), false);
    }

    store.set(hasUserSelectedAllRecords, false);
    store.set(recordSelectionRange, null);

    closeDropdown(
      getCommandMenuDropdownIdFromCommandMenuId(
        getCommandMenuIdFromRecordIndexId(instanceId),
      ),
    );
  }, [
    selectedRecordIds,
    isRecordSelectedFamilyState,
    hasUserSelectedAllRecords,
    recordSelectionRange,
    closeDropdown,
    instanceId,
    store,
  ]);

  return {
    resetRecordSelection,
  };
};
