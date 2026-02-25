import { useStore } from 'jotai';

import { useResetRecordBoardSelection } from '@/object-record/record-board/hooks/useResetRecordBoardSelection';
import { recordBoardSelectedRecordIdsComponentSelector } from '@/object-record/record-board/states/selectors/recordBoardSelectedRecordIdsComponentSelector';
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

  const groupByFieldMetadataItem = useAtomComponentStateValue(
    recordIndexGroupFieldMetadataItemComponentState,
    recordBoardIndexId,
  );

  const recordIndexRecordIdsByGroupCallbackState =
    useAtomComponentFamilyStateCallbackState(
      recordIndexRecordIdsByGroupComponentFamilyState,
      recordBoardIndexId,
    );

  const recordBoardSelectedRecordIds = useAtomComponentSelectorCallbackState(
    recordBoardSelectedRecordIdsComponentSelector,
    recordBoardIndexId,
  );

  const { resetRecordBoardSelection } =
    useResetRecordBoardSelection(recordBoardIndexId);

  const removeSelectedRecordsFromRecordBoard = useCallback(() => {
    const deletedRecordIds = store.get(
      recordBoardSelectedRecordIds,
    ) as string[];

    if (
      !isDefined(groupByFieldMetadataItem) ||
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

    resetRecordBoardSelection();
  }, [
    store,
    groupByFieldMetadataItem,
    recordIndexRecordIdsByGroupCallbackState,
    recordGroupDefinitions,
    recordBoardSelectedRecordIds,
    resetRecordBoardSelection,
  ]);

  return {
    removeSelectedRecordsFromRecordBoard,
  };
};
