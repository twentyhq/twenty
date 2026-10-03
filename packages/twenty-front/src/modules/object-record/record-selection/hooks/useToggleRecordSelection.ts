import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { isRecordSelectedComponentFamilyState } from '@/object-record/record-selection/states/isRecordSelectedComponentFamilyState';
import { recordSelectionRangeComponentState } from '@/object-record/record-selection/states/recordSelectionRangeComponentState';
import { getRecordIdsBetween } from '@/object-record/record-selection/utils/getRecordIdsBetween';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomComponentSelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorCallbackState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';

export const useToggleRecordSelection = (recordIndexId?: string) => {
  const isRecordSelectedFamilyState = useAtomComponentFamilyStateCallbackState(
    isRecordSelectedComponentFamilyState,
    recordIndexId,
  );

  const allRecordIds = useAtomComponentSelectorCallbackState(
    recordIndexAllRecordIdsComponentSelector,
    recordIndexId,
  );

  const recordSelectionRange = useAtomComponentStateCallbackState(
    recordSelectionRangeComponentState,
    recordIndexId,
  );

  const store = useStore();

  const toggleRecordSelection = useCallback(
    ({
      recordId,
      shouldSelectRange = false,
    }: {
      recordId: string;
      shouldSelectRange?: boolean;
    }) => {
      const range = store.get(recordSelectionRange);
      const recordIds = store.get(allRecordIds);

      if (
        shouldSelectRange &&
        isDefined(range) &&
        recordIds.includes(range.anchorRecordId)
      ) {
        for (const previousRangeRecordId of getRecordIdsBetween({
          recordIds,
          firstRecordId: range.anchorRecordId,
          secondRecordId: range.leadRecordId,
        })) {
          store.set(isRecordSelectedFamilyState(previousRangeRecordId), false);
        }

        for (const rangeRecordId of getRecordIdsBetween({
          recordIds,
          firstRecordId: range.anchorRecordId,
          secondRecordId: recordId,
        })) {
          store.set(isRecordSelectedFamilyState(rangeRecordId), true);
        }

        store.set(recordSelectionRange, {
          anchorRecordId: range.anchorRecordId,
          leadRecordId: recordId,
        });

        return;
      }

      const isSelected = !store.get(isRecordSelectedFamilyState(recordId));

      store.set(isRecordSelectedFamilyState(recordId), isSelected);
      store.set(
        recordSelectionRange,
        isSelected
          ? { anchorRecordId: recordId, leadRecordId: recordId }
          : null,
      );
    },
    [allRecordIds, isRecordSelectedFamilyState, recordSelectionRange, store],
  );

  return {
    toggleRecordSelection,
  };
};
