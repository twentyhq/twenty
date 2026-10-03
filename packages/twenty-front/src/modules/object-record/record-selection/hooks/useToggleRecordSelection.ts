import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { RecordSelectionComponentInstanceContext } from '@/object-record/record-selection/states/contexts/RecordSelectionComponentInstanceContext';
import { isRecordSelectedComponentFamilyState } from '@/object-record/record-selection/states/isRecordSelectedComponentFamilyState';
import { recordSelectionRangeComponentState } from '@/object-record/record-selection/states/recordSelectionRangeComponentState';
import { getRecordIdsBetween } from '@/object-record/record-selection/utils/getRecordIdsBetween';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomComponentSelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorCallbackState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';

export const useToggleRecordSelection = (recordIndexId?: string) => {
  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordSelectionComponentInstanceContext,
    recordIndexId,
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
        const previousRangeRecordIds = getRecordIdsBetween({
          recordIds,
          firstRecordId: range.anchorRecordId,
          secondRecordId: range.leadRecordId,
        });
        const rangeRecordIds = new Set(
          getRecordIdsBetween({
            recordIds,
            firstRecordId: range.anchorRecordId,
            secondRecordId: recordId,
          }),
        );

        for (const previousRangeRecordId of previousRangeRecordIds) {
          if (!rangeRecordIds.has(previousRangeRecordId)) {
            store.set(
              isRecordSelectedFamilyState(previousRangeRecordId),
              false,
            );
          }
        }

        for (const rangeRecordId of rangeRecordIds) {
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
