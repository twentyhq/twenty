import { useStore } from 'jotai';
import { useCallback } from 'react';

import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { useResetRecordSelection } from '@/object-record/record-selection/hooks/useResetRecordSelection';
import { RecordSelectionComponentInstanceContext } from '@/object-record/record-selection/states/contexts/RecordSelectionComponentInstanceContext';
import { isRecordSelectedComponentFamilyState } from '@/object-record/record-selection/states/isRecordSelectedComponentFamilyState';
import { recordSelectionRangeComponentState } from '@/object-record/record-selection/states/recordSelectionRangeComponentState';
import { allRecordsSelectedStatusComponentSelector } from '@/object-record/record-selection/states/selectors/allRecordsSelectedStatusComponentSelector';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomComponentSelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorCallbackState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';

// A list that is not a record index provides a selection instance but no view instance
export const useSelectAllRecords = (recordIndexId?: string) => {
  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordSelectionComponentInstanceContext,
    recordIndexId,
  );

  const allRecordsSelectedStatus = useAtomComponentSelectorCallbackState(
    allRecordsSelectedStatusComponentSelector,
    instanceId,
  );

  const isRecordSelectedFamilyState = useAtomComponentFamilyStateCallbackState(
    isRecordSelectedComponentFamilyState,
    instanceId,
  );

  const allRecordIds = useAtomComponentSelectorCallbackState(
    recordIndexAllRecordIdsComponentSelector,
    instanceId,
  );

  const recordSelectionRange = useAtomComponentStateCallbackState(
    recordSelectionRangeComponentState,
    instanceId,
  );

  const { resetRecordSelection } = useResetRecordSelection(instanceId);

  const store = useStore();

  const selectAllRecords = useCallback(() => {
    if (store.get(allRecordsSelectedStatus) === 'all') {
      resetRecordSelection();
      return false;
    }

    for (const recordId of store.get(allRecordIds)) {
      store.set(isRecordSelectedFamilyState(recordId), true);
    }

    store.set(recordSelectionRange, null);

    return true;
  }, [
    allRecordsSelectedStatus,
    allRecordIds,
    recordSelectionRange,
    resetRecordSelection,
    isRecordSelectedFamilyState,
    store,
  ]);

  return {
    selectAllRecords,
  };
};
