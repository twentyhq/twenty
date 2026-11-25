import { recordGroupIdsComponentState } from '@/object-record/record-group/states/recordGroupIdsComponentState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { NO_RECORD_GROUP_FAMILY_KEY } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { useResetRecordSelection } from '@/object-record/record-selection/hooks/useResetRecordSelection';
import { isRecordSelectedComponentFamilyState } from '@/object-record/record-selection/states/isRecordSelectedComponentFamilyState';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';

// resetRecordSelection only clears the ids of the current layout, which can already be All's after a tab change
export const useResetRecordSelectionAcrossRecordGroups = (
  recordIndexId: string,
) => {
  const store = useStore();

  const recordGroupIds = useAtomComponentStateCallbackState(
    recordGroupIdsComponentState,
    recordIndexId,
  );

  const recordIdsByGroupFamilyState = useAtomComponentFamilyStateCallbackState(
    recordIndexRecordIdsByGroupComponentFamilyState,
    recordIndexId,
  );

  const isRecordSelectedFamilyState = useAtomComponentFamilyStateCallbackState(
    isRecordSelectedComponentFamilyState,
    recordIndexId,
  );

  const { resetRecordSelection } = useResetRecordSelection(recordIndexId);

  const resetRecordSelectionAcrossRecordGroups = useCallback(() => {
    const familyKeys = [
      ...store.get(recordGroupIds),
      NO_RECORD_GROUP_FAMILY_KEY,
    ];

    for (const familyKey of familyKeys) {
      for (const recordId of store.get(
        recordIdsByGroupFamilyState(familyKey),
      )) {
        store.set(isRecordSelectedFamilyState(recordId), false);
      }
    }

    resetRecordSelection();
  }, [
    isRecordSelectedFamilyState,
    recordGroupIds,
    recordIdsByGroupFamilyState,
    resetRecordSelection,
    store,
  ]);

  return { resetRecordSelectionAcrossRecordGroups };
};
