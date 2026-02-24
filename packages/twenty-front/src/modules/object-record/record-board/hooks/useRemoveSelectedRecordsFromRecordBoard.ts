import { useStore } from 'jotai';

import { useResetRecordBoardSelection } from '@/object-record/record-board/hooks/useResetRecordBoardSelection';
import { recordBoardSelectedRecordIdsComponentSelector } from '@/object-record/record-board/states/selectors/recordBoardSelectedRecordIdsComponentSelector';
import { recordGroupDefinitionsComponentSelector } from '@/object-record/record-group/states/selectors/recordGroupDefinitionsComponentSelector';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { useRecoilComponentSelectorCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentSelectorCallbackStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { useRecoilComponentFamilyStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentFamilyStateCallbackStateV2';
import { useRecoilComponentSelectorValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentSelectorValueV2';
import { useCallback } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

export const useRemoveSelectedRecordsFromRecordBoard = (
  recordBoardIndexId: string,
) => {
  const store = useStore();
  const recordGroupDefinitions = useRecoilComponentSelectorValueV2(
    recordGroupDefinitionsComponentSelector,
    recordBoardIndexId,
  );

  const groupByFieldMetadataItem = useRecoilComponentValueV2(
    recordIndexGroupFieldMetadataItemComponentState,
    recordBoardIndexId,
  );

  const recordIndexRecordIdsByGroupCallbackState =
    useRecoilComponentFamilyStateCallbackStateV2(
      recordIndexRecordIdsByGroupComponentFamilyState,
      recordBoardIndexId,
    );

  const recordBoardSelectedRecordIds =
    useRecoilComponentSelectorCallbackStateV2(
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
