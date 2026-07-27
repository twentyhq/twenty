import { useStore } from 'jotai';

import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { type ObjectRecordOperationBrowserEventDetail } from '@/browser-event/types/ObjectRecordOperationBrowserEventDetail';
import { useGetRecordBoardEffectsForUpdateInputs } from '@/object-record/record-board/hooks/useGetRecordBoardEffectsForUpdateInputs';
import { useRemoveRecordsFromBoard } from '@/object-record/record-board/hooks/useRemoveRecordsFromBoard';
import { useRepositionRecordsOnBoard } from '@/object-record/record-board/hooks/useRepositionRecordsOnBoard';
import { useTriggerRecordBoardInitialQuery } from '@/object-record/record-board/hooks/useTriggerRecordBoardInitialQuery';
import { recordGroupFromGroupValueComponentFamilySelector } from '@/object-record/record-group/states/selectors/recordGroupFromGroupValueComponentFamilySelector';
import { getFieldMetadataItemGqlFieldName } from '@/object-metadata/utils/getFieldMetadataItemGqlFieldName';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useAtomComponentFamilySelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorCallbackState';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useCallback } from 'react';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';

export const RecordBoardDataChangedEffect = () => {
  const store = useStore();
  const { objectMetadataItem } = useRecordIndexContextOrThrow();
  const { triggerRecordBoardInitialQuery } =
    useTriggerRecordBoardInitialQuery();
  const { getRecordBoardEffectsForUpdateInputs } =
    useGetRecordBoardEffectsForUpdateInputs();
  const { repositionRecordsOnBoard } = useRepositionRecordsOnBoard();

  const recordGroupFromGroupValueCallbackState =
    useAtomComponentFamilySelectorCallbackState(
      recordGroupFromGroupValueComponentFamilySelector,
    );
  const recordIndexGroupFieldMetadataItem = useAtomComponentStateCallbackState(
    recordIndexGroupFieldMetadataItemComponentState,
  );
  const recordIndexRecordIdsByGroupCallbackState =
    useAtomComponentFamilyStateCallbackState(
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

            const recordBoardUpdateEffect =
              getRecordBoardEffectsForUpdateInputs(updateInputs);

            switch (recordBoardUpdateEffect) {
              case 'trigger-initial-query': {
                triggerRecordBoardInitialQuery({ shouldResetScroll: false });
                break;
              }
              case 'reposition-records': {
                const allRecordsRepositioned =
                  repositionRecordsOnBoard(updateInputs);

                if (!allRecordsRepositioned) {
                  triggerRecordBoardInitialQuery({ shouldResetScroll: false });
                }
                break;
              }
              case 'none': {
                break;
              }
              default: {
                assertUnreachable(recordBoardUpdateEffect);
              }
            }
          }
          break;
        case 'create-one': {
          if (objectRecordOperation.createdRecord.position === 'first') {
            triggerRecordBoardInitialQuery({ shouldResetScroll: false });
          } else {
            const createdRecordPosition =
              objectRecordOperation.createdRecord.position;

            if (!isDefined(createdRecordPosition)) {
              return;
            }

            const currentRecordIndexGroupFieldMetadataItem = store.get(
              recordIndexGroupFieldMetadataItem,
            );

            if (!isDefined(currentRecordIndexGroupFieldMetadataItem)) {
              return;
            }

            const recordGroupValue =
              objectRecordOperation.createdRecord[
                getFieldMetadataItemGqlFieldName(
                  currentRecordIndexGroupFieldMetadataItem,
                )
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
              triggerRecordBoardInitialQuery({ shouldResetScroll: false });
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
              triggerRecordBoardInitialQuery({ shouldResetScroll: false });
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
          triggerRecordBoardInitialQuery({ shouldResetScroll: false });
        }
      }
    },
    [
      store,
      triggerRecordBoardInitialQuery,
      getRecordBoardEffectsForUpdateInputs,
      repositionRecordsOnBoard,
      recordIndexGroupFieldMetadataItem,
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
