import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { recordIndexDisplayedRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexDisplayedRecordIdsComponentSelector';
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

  const displayedRecordIds = useAtomComponentSelectorCallbackState(
    recordIndexDisplayedRecordIdsComponentSelector,
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
      const recordIds = store.get(displayedRecordIds);

      if (
        shouldSelectRange &&
        isDefined(range) &&
        recordIds.includes(range.anchorRecordId) &&
        recordIds.includes(recordId)
      ) {
        const previouslyAddedRecordIds = new Set(range.addedRecordIds);
        const rangeRecordIds = getRecordIdsBetween({
          recordIds,
          firstRecordId: range.anchorRecordId,
          secondRecordId: recordId,
        });
        const rangeRecordIdSet = new Set(rangeRecordIds);
        const addedRecordIds = rangeRecordIds.filter(
          (rangeRecordId) =>
            previouslyAddedRecordIds.has(rangeRecordId) ||
            !store.get(isRecordSelectedFamilyState(rangeRecordId)),
        );

        for (const previouslyAddedRecordId of previouslyAddedRecordIds) {
          if (!rangeRecordIdSet.has(previouslyAddedRecordId)) {
            store.set(
              isRecordSelectedFamilyState(previouslyAddedRecordId),
              false,
            );
          }
        }

        for (const rangeRecordId of rangeRecordIds) {
          store.set(isRecordSelectedFamilyState(rangeRecordId), true);
        }

        store.set(recordSelectionRange, {
          anchorRecordId: range.anchorRecordId,
          addedRecordIds,
        });

        return;
      }

      const isSelected = !store.get(isRecordSelectedFamilyState(recordId));

      store.set(isRecordSelectedFamilyState(recordId), isSelected);
      store.set(
        recordSelectionRange,
        isSelected ? { anchorRecordId: recordId, addedRecordIds: [] } : null,
      );
    },
    [
      displayedRecordIds,
      isRecordSelectedFamilyState,
      recordSelectionRange,
      store,
    ],
  );

  return {
    toggleRecordSelection,
  };
};
