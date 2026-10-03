import { useStore } from 'jotai';

import { useResetRecordSelection } from '@/object-record/record-selection/hooks/useResetRecordSelection';
import { selectedRecordIdsComponentSelector } from '@/object-record/record-selection/states/selectors/selectedRecordIdsComponentSelector';
import { recordGroupDefinitionsComponentSelector } from '@/object-record/record-group/states/selectors/recordGroupDefinitionsComponentSelector';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { useAtomComponentSelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorCallbackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useCallback } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

export const useRemoveSelectedRecordsFromRecordBoard = (
  recordBoardIndexId: string,
) => {
  const store = useStore();
  const recordGroupDefinitions = useAtomComponentSelectorValue(
    recordGroupDefinitionsComponentSelector,
    recordBoardIndexId,
  );

  const recordIndexGroupFieldMetadataItem = useAtomComponentStateValue(
    recordIndexGroupFieldMetadataItemComponentState,
    recordBoardIndexId,
  );

  const recordIndexRecordIdsByGroupCallbackState =
    useAtomComponentFamilyStateCallbackState(
      recordIndexRecordIdsByGroupComponentFamilyState,
      recordBoardIndexId,
    );

  const recordBoardSelectedRecordIds = useAtomComponentSelectorCallbackState(
    selectedRecordIdsComponentSelector,
    recordBoardIndexId,
  );

  const { resetRecordSelection } = useResetRecordSelection(recordBoardIndexId);

  const removeSelectedRecordsFromRecordBoard = useCallback(() => {
    const deletedRecordIds = store.get(
      recordBoardSelectedRecordIds,
    ) as string[];

    if (
      !isDefined(recordIndexGroupFieldMetadataItem) ||
      !isNonEmptyArray(recordGroupDefinitions) ||
      !isNonEmptyArray(deletedRecordIds)
    ) {
      return;
    }

    for (const recordGroup of recordGroupDefinitions) {
      const currentRecordIds = store.get(
        recordIndexRecordIdsByGroupCallbackState(recordGroup.id),
      ) as string[];

      let groupRecordIdsUpdated = [...currentRecordIds];

      for (const deletedRecordId of deletedRecordIds) {
        const indexOfDeletedRecordIdInGroupRecordIds =
          groupRecordIdsUpdated.findIndex(
            (recordIdInRecordGroup) =>
              recordIdInRecordGroup === deletedRecordId,
          );

        if (indexOfDeletedRecordIdInGroupRecordIds > -1) {
          groupRecordIdsUpdated = groupRecordIdsUpdated.toSpliced(
            indexOfDeletedRecordIdInGroupRecordIds,
            1,
          );
        }
      }

      if (groupRecordIdsUpdated.length !== currentRecordIds.length) {
        store.set(
          recordIndexRecordIdsByGroupCallbackState(recordGroup.id),
          groupRecordIdsUpdated,
        );
      }
    }

    resetRecordSelection();
  }, [
    store,
    recordIndexGroupFieldMetadataItem,
    recordIndexRecordIdsByGroupCallbackState,
    recordGroupDefinitions,
    recordBoardSelectedRecordIds,
    resetRecordSelection,
  ]);

  return {
    removeSelectedRecordsFromRecordBoard,
  };
};
