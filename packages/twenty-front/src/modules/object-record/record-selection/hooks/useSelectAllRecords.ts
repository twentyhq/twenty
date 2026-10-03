import { useStore } from 'jotai';
import { useCallback } from 'react';

import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { useResetRecordSelection } from '@/object-record/record-selection/hooks/useResetRecordSelection';
import { isRecordSelectedComponentFamilyState } from '@/object-record/record-selection/states/isRecordSelectedComponentFamilyState';
import { allRecordsSelectedStatusComponentSelector } from '@/object-record/record-selection/states/selectors/allRecordsSelectedStatusComponentSelector';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomComponentSelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorCallbackState';

export const useSelectAllRecords = (recordIndexId?: string) => {
  const allRecordsSelectedStatus = useAtomComponentSelectorCallbackState(
    allRecordsSelectedStatusComponentSelector,
    recordIndexId,
  );

  const isRecordSelectedFamilyState = useAtomComponentFamilyStateCallbackState(
    isRecordSelectedComponentFamilyState,
    recordIndexId,
  );

  const allRecordIds = useAtomComponentSelectorCallbackState(
    recordIndexAllRecordIdsComponentSelector,
    recordIndexId,
  );

  const { resetRecordSelection } = useResetRecordSelection(recordIndexId);

  const store = useStore();

  const selectAllRecords = useCallback(() => {
    const currentAllRecordsSelectedStatus = store.get(allRecordsSelectedStatus);

    if (currentAllRecordsSelectedStatus === 'all') {
      resetRecordSelection();
    }

    for (const recordId of store.get(allRecordIds)) {
      store.set(
        isRecordSelectedFamilyState(recordId),
        currentAllRecordsSelectedStatus !== 'all',
      );
    }
  }, [
    allRecordsSelectedStatus,
    allRecordIds,
    resetRecordSelection,
    isRecordSelectedFamilyState,
    store,
  ]);

  return {
    selectAllRecords,
  };
};
