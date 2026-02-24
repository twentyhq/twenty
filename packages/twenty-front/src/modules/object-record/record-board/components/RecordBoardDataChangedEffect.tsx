import { useStore } from 'jotai';

import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { useGetShouldInitializeRecordBoardForUpdateInputs } from '@/object-record/record-board/hooks/useGetShouldInitializeRecordBoardForUpdateInputs';
import { useRemoveRecordsFromBoard } from '@/object-record/record-board/hooks/useRemoveRecordsFromBoard';
import { useTriggerRecordBoardInitialQuery } from '@/object-record/record-board/hooks/useTriggerRecordBoardInitialQuery';
import { recordGroupFromGroupValueComponentFamilySelector } from '@/object-record/record-group/states/selectors/recordGroupFromGroupValueComponentFamilySelector';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type ObjectRecordOperationBrowserEventDetail } from '@/browser-event/types/ObjectRecordOperationBrowserEventDetail';
import { useRecoilComponentFamilySelectorCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentFamilySelectorCallbackStateV2';
import { useRecoilComponentFamilyStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentFamilyStateCallbackStateV2';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const RecordBoardDataChangedEffect = () => {
  const store = useStore();
  const { objectMetadataItem } = useRecordIndexContextOrThrow();
  const { triggerRecordBoardInitialQuery } =
    useTriggerRecordBoardInitialQuery();
  const { getShouldInitializeRecordBoardForUpdateInputs } =
    useGetShouldInitializeRecordBoardForUpdateInputs();

  const recordGroupFromGroupValueCallbackState =
    useRecoilComponentFamilySelectorCallbackStateV2(
      recordGroupFromGroupValueComponentFamilySelector,
    );
  const recordIndexGroupFieldMetadataItemAtom =
    useRecoilComponentStateCallbackStateV2(
      recordIndexGroupFieldMetadataItemComponentState,
    );
  const recordIndexRecordIdsByGroupCallbackState =
    useRecoilComponentFamilyStateCallbackStateV2(
      recordIndexRecordIdsByGroupComponentFamilyState,
    );

  const { removeRecordsFromBoard } = useRemoveRecordsFromBoard();

  const handleObjectRecordOperation = useCallback(
    (
      objectRecordOperationEventDetail: ObjectRecordOperationBrowserEventDetail,
    ) => {
      const objectRecordOperation = objectRecordOperationEventDetail.operation;

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

            const recordIndexGroupFieldMetadataItem = store.get(
              recordIndexGroupFieldMetadataItemAtom,
            );

            if (!isDefined(recordIndexGroupFieldMetadataItem)) {
              return;
            }

            const recordGroupValue =
              objectRecordOperation.createdRecord[
                recordIndexGroupFieldMetadataItem.name
              ];

            const recordGroupDefinitionFromGroupValue = store.get(
              recordGroupFromGroupValueCallbackState({ recordGroupValue }),
            );

            if (!isDefined(recordGroupDefinitionFromGroupValue)) {
              return;
            }

            const recordIdsForGroup = store.get(
              recordIndexRecordIdsByGroupCallbackState(
                recordGroupDefinitionFromGroupValue.id,
              ),
            );

            const recordIdsWithoutCreatedRecord = recordIdsForGroup.filter(
              (recordId) => recordId !== objectRecordOperation.createdRecord.id,
            );

            const groupIsEmpty = recordIdsWithoutCreatedRecord.length === 0;

            if (groupIsEmpty) {
              triggerRecordBoardInitialQuery();
              return;
            }

            const firstRecordIdInGroup = recordIdsWithoutCreatedRecord[0];
            const firstExistingRecordInGroup = store.get(
              recordStoreFamilyState.atomFamily(firstRecordIdInGroup),
            ) as { position?: number } | null | undefined;

            if (!isDefined(firstExistingRecordInGroup)) {
              return;
            }

            if (
              createdRecordPosition < (firstExistingRecordInGroup.position ?? 0)
            ) {
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
      store,
      triggerRecordBoardInitialQuery,
      getShouldInitializeRecordBoardForUpdateInputs,
      recordIndexGroupFieldMetadataItemAtom,
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
