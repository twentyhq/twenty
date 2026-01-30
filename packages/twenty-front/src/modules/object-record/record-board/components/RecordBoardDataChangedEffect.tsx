import { useListenToObjectRecordOperationBrowserEvent } from '@/object-record/hooks/useListenToObjectRecordOperationBrowserEvent';
import { useGetShouldInitializeRecordBoardForUpdateInputs } from '@/object-record/record-board/hooks/useGetShouldInitializeRecordBoardForUpdateInputs';
import { useRemoveRecordsFromBoard } from '@/object-record/record-board/hooks/useRemoveRecordsFromBoard';
import { useTriggerRecordBoardInitialQuery } from '@/object-record/record-board/hooks/useTriggerRecordBoardInitialQuery';
import { recordGroupFromGroupValueComponentFamilySelector } from '@/object-record/record-group/states/selectors/recordGroupFromGroupValueComponentFamilySelector';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type ObjectRecordOperationBrowserEventDetail } from '@/object-record/types/ObjectRecordOperationBrowserEventDetail';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const RecordBoardDataChangedEffect = () => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();
  const { triggerRecordBoardInitialQuery } =
    useTriggerRecordBoardInitialQuery();
  const { getShouldInitializeRecordBoardForUpdateInputs } =
    useGetShouldInitializeRecordBoardForUpdateInputs();

  const recordGroupFromGroupValueCallbackState =
    useRecoilComponentCallbackState(
      recordGroupFromGroupValueComponentFamilySelector,
    );
  const recordIndexGroupFieldMetadataItemCallbackState =
    useRecoilComponentCallbackState(
      recordIndexGroupFieldMetadataItemComponentState,
    );
  const recordIndexRecordIdsByGroupCallbackState =
    useRecoilComponentCallbackState(
      recordIndexRecordIdsByGroupComponentFamilyState,
    );

  const { removeRecordsFromBoard } = useRemoveRecordsFromBoard();

  const handleObjectRecordOperation = useRecoilCallback(
    ({ snapshot }) =>
      (
        objectRecordOperationEventDetail: ObjectRecordOperationBrowserEventDetail,
      ) => {
        const objectRecordOperation =
          objectRecordOperationEventDetail.operation;

        switch (objectRecordOperation.type) {
          case 'update-one':
          case 'update-many':
            {
              const updateInputs =
                objectRecordOperation.type === 'update-one'
                  ? [objectRecordOperation.result.updateInput]
                  : objectRecordOperation.result.updateInputs;

              const shouldInitializeForUpdateOperation =
                getShouldInitializeRecordBoardForUpdateInputs(updateInputs);

              if (shouldInitializeForUpdateOperation) {
                triggerRecordBoardInitialQuery();
              }
            }
            break;
          case 'create-one': {
            if (objectRecordOperation.createdRecord.position === 'first') {
              triggerRecordBoardInitialQuery();
            } else {
              const createdRecordPosition =
                objectRecordOperation.createdRecord.position;

              if (!isDefined(createdRecordPosition)) {
                return;
              }

              const recordIndexGroupFieldMetadataItem = getSnapshotValue(
                snapshot,
                recordIndexGroupFieldMetadataItemCallbackState,
              );

              if (!isDefined(recordIndexGroupFieldMetadataItem)) {
                return;
              }

              const recordGroupValue =
                objectRecordOperation.createdRecord[
                  recordIndexGroupFieldMetadataItem.name
                ];

              const recordGroupDefinitionFromGroupValue = getSnapshotValue(
                snapshot,
                recordGroupFromGroupValueCallbackState({ recordGroupValue }),
              );

              if (!isDefined(recordGroupDefinitionFromGroupValue)) {
                return;
              }

              const recordIdsForGroup = getSnapshotValue(
                snapshot,
                recordIndexRecordIdsByGroupCallbackState(
                  recordGroupDefinitionFromGroupValue.id,
                ),
              );

              const recordIdsWithoutCreatedRecord = recordIdsForGroup.filter(
                (recordId) =>
                  recordId !== objectRecordOperation.createdRecord.id,
              );

              const groupIsEmpty = recordIdsWithoutCreatedRecord.length === 0;

              if (groupIsEmpty) {
                triggerRecordBoardInitialQuery();
                return;
              }

              const firstRecordIdInGroup = recordIdsWithoutCreatedRecord[0];
              const firstExistingRecordInGroup = getSnapshotValue(
                snapshot,
                recordStoreFamilyState(firstRecordIdInGroup),
              );

              if (!isDefined(firstExistingRecordInGroup)) {
                return;
              }

              if (createdRecordPosition < firstExistingRecordInGroup.position) {
                triggerRecordBoardInitialQuery();
              }
            }
            break;
          }
          case 'delete-one': {
            const removedRecordId = objectRecordOperation.deletedRecordId;

            removeRecordsFromBoard({
              recordIdsToRemove: [removedRecordId],
            });
            return;
          }
          case 'delete-many': {
            const removedRecordIds = objectRecordOperation.deletedRecordIds;

            removeRecordsFromBoard({
              recordIdsToRemove: removedRecordIds,
            });
            return;
          }
          case 'restore-many':
          case 'restore-one': {
            return;
          }
          default: {
            triggerRecordBoardInitialQuery();
          }
        }
      },
    [
      triggerRecordBoardInitialQuery,
      getShouldInitializeRecordBoardForUpdateInputs,
      recordIndexGroupFieldMetadataItemCallbackState,
      recordGroupFromGroupValueCallbackState,
      recordIndexRecordIdsByGroupCallbackState,
      removeRecordsFromBoard,
    ],
  );

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: handleObjectRecordOperation,
    objectMetadataItemId: objectMetadataItem.id,
  });

  return null;
};
