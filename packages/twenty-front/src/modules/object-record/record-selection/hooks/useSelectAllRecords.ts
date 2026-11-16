import { useStore } from 'jotai';
import { useCallback } from 'react';

import { recordIndexSelectableRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexSelectableRecordIdsComponentSelector';
import { useResetRecordSelection } from '@/object-record/record-selection/hooks/useResetRecordSelection';
import { isRecordSelectedComponentFamilyState } from '@/object-record/record-selection/states/isRecordSelectedComponentFamilyState';
import { recordSelectionRangeComponentState } from '@/object-record/record-selection/states/recordSelectionRangeComponentState';
import { allRecordsSelectedStatusComponentSelector } from '@/object-record/record-selection/states/selectors/allRecordsSelectedStatusComponentSelector';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomComponentSelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorCallbackState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';

export const useSelectAllRecords = (recordIndexId?: string) => {
  const allRecordsSelectedStatus = useAtomComponentSelectorCallbackState(
    allRecordsSelectedStatusComponentSelector,
    recordIndexId,
  );

  const isRecordSelectedFamilyState = useAtomComponentFamilyStateCallbackState(
    isRecordSelectedComponentFamilyState,
    recordIndexId,
  );

  const selectableRecordIds = useAtomComponentSelectorCallbackState(
    recordIndexSelectableRecordIdsComponentSelector,
    recordIndexId,
  );

  const recordSelectionRange = useAtomComponentStateCallbackState(
    recordSelectionRangeComponentState,
    recordIndexId,
  );

  const { resetRecordSelection } = useResetRecordSelection(recordIndexId);

  const store = useStore();

  const selectAllRecords = useCallback(() => {
    if (store.get(allRecordsSelectedStatus) === 'all') {
      resetRecordSelection();
      return false;
    }

    for (const recordId of store.get(selectableRecordIds)) {
      store.set(isRecordSelectedFamilyState(recordId), true);
    }

    store.set(recordSelectionRange, null);

    return true;
  }, [
    allRecordsSelectedStatus,
    selectableRecordIds,
    recordSelectionRange,
    resetRecordSelection,
    isRecordSelectedFamilyState,
    store,
  ]);

  return {
    selectAllRecords,
  };
};
