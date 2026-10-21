import { useStore } from 'jotai';

import { useResetRecordSelection } from '@/object-record/record-selection/hooks/useResetRecordSelection';
import { selectedRecordIdsComponentSelector } from '@/object-record/record-selection/states/selectors/selectedRecordIdsComponentSelector';
import { recordGroupDefinitionsComponentSelector } from '@/object-record/record-group/states/selectors/recordGroupDefinitionsComponentSelector';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { recordIndexViewTypeState } from '@/object-record/record-index/states/recordIndexViewTypeState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { useAtomComponentSelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorCallbackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { ViewType } from '@/views/types/ViewType';
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

  const selectedRecordIds = useAtomComponentSelectorCallbackState(
    selectedRecordIdsComponentSelector,
    recordBoardIndexId,
  );

  const { resetRecordSelection } = useResetRecordSelection(recordBoardIndexId);

  const recordIndexViewType = useAtomComponentStateValue(
    recordIndexViewTypeState,
    recordBoardIndexId,
  );

  // Table and board share the selection, but only the board drops deleted
  // cards from its columns before the server confirms
  const removeSelectedRecordsFromRecordBoard = useCallback(() => {
    if (recordIndexViewType !== ViewType.KANBAN) {
      return;
    }

    const deletedRecordIds = store.get(selectedRecordIds);

    if (
      !isDefined(recordIndexGroupFieldMetadataItem) ||
      !isNonEmptyArray(recordGroupDefinitions) ||
      !isNonEmptyArray(deletedRecordIds)
    ) {
      return;
    }

    // Cleared while the cards are still listed, since the selection only
    // covers listed records
    resetRecordSelection();

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
  }, [
    recordIndexViewType,
    store,
    recordIndexGroupFieldMetadataItem,
    recordIndexRecordIdsByGroupCallbackState,
    recordGroupDefinitions,
    selectedRecordIds,
    resetRecordSelection,
  ]);

  return {
    removeSelectedRecordsFromRecordBoard,
  };
};
