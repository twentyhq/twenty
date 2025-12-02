import { useResetRecordBoardSelection } from '@/object-record/record-board/hooks/useResetRecordBoardSelection';
import { recordBoardSelectedRecordIdsComponentSelector } from '@/object-record/record-board/states/selectors/recordBoardSelectedRecordIdsComponentSelector';
import { recordGroupDefinitionsComponentSelector } from '@/object-record/record-group/states/selectors/recordGroupDefinitionsComponentSelector';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useRecoilCallback } from 'recoil';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

export const useRemoveSelectedRecordsFromRecordBoard = (
  recordBoardIndexId: string,
) => {
  const recordGroupDefinitions = useRecoilComponentValue(
    recordGroupDefinitionsComponentSelector,
    recordBoardIndexId,
  );

  const groupByFieldMetadataItem = useRecoilComponentValue(
    recordIndexGroupFieldMetadataItemComponentState,
    recordBoardIndexId,
  );

  const recordIndexRecordIdsByGroupCallbackState =
    useRecoilComponentCallbackState(
      recordIndexRecordIdsByGroupComponentFamilyState,
      recordBoardIndexId,
    );

  const recordBoardSelectedRecordIdsCallbackSelector =
    useRecoilComponentCallbackState(
      recordBoardSelectedRecordIdsComponentSelector,
      recordBoardIndexId,
    );

  const { resetRecordBoardSelection } =
    useResetRecordBoardSelection(recordBoardIndexId);

  const removeSelectedRecordsFromRecordBoard = useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        const deletedRecordIds = getSnapshotValue(
          snapshot,
          recordBoardSelectedRecordIdsCallbackSelector,
        );

        if (
          !isDefined(groupByFieldMetadataItem) ||
          !isNonEmptyArray(recordGroupDefinitions) ||
          !isNonEmptyArray(deletedRecordIds)
        ) {
          return;
        }

        for (const recordGroup of recordGroupDefinitions) {
          const currentRecordIds = getSnapshotValue(
            snapshot,
            recordIndexRecordIdsByGroupCallbackState(recordGroup.id),
          );

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
            set(
              recordIndexRecordIdsByGroupCallbackState(recordGroup.id),
              groupRecordIdsUpdated,
            );
          }
        }

        resetRecordBoardSelection();
      },
    [
      groupByFieldMetadataItem,
      recordIndexRecordIdsByGroupCallbackState,
      recordGroupDefinitions,
      recordBoardSelectedRecordIdsCallbackSelector,
      resetRecordBoardSelection,
    ],
  );

  return {
    removeSelectedRecordsFromRecordBoard,
  };
};
