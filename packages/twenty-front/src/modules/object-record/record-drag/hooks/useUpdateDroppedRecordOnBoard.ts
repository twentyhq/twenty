import { useStore } from 'jotai';

import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { useCompleteRecordUpdate } from '@/object-record/record-form/hooks/useCompleteRecordUpdate';
import { extractRecordPositions } from '@/object-record/record-drag/utils/extractRecordPositions';
import { recordGroupDefinitionsComponentSelector } from '@/object-record/record-group/states/selectors/recordGroupDefinitionsComponentSelector';
import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { getFieldMetadataItemGqlFieldName } from '@/object-metadata/utils/getFieldMetadataItemGqlFieldName';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useCallback, useContext } from 'react';
import { findByProperty, isDefined } from 'twenty-shared/utils';
import { sortByProperty } from '~/utils/array/sortByProperty';

export const useUpdateDroppedRecordOnBoard = () => {
  const store = useStore();
  const { updateOneRecord, selectFieldMetadataItem, objectMetadataItem } =
    useContext(RecordBoardContext);
  const { completeRecordUpdate } = useCompleteRecordUpdate({
    objectMetadataItem,
  });

  const recordIndexRecordIdsByGroupCallbackFamilyState =
    useAtomComponentFamilyStateCallbackState(
      recordIndexRecordIdsByGroupComponentFamilyState,
    );

  const recordGroupDefinitions = useAtomComponentSelectorValue(
    recordGroupDefinitionsComponentSelector,
  );

  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const updateDroppedRecordOnBoard = useCallback(
    async (
      {
        recordId,
        position: newPosition,
      }: {
        recordId: string;
        position?: number;
      },
      targetRecordGroupValue: RecordGroupDefinition['value'],
    ) => {
      const initialRecord = store.get(
        recordStoreFamilyState.atomFamily(recordId),
      ) as Record<string, unknown> | null | undefined;

      if (!isDefined(initialRecord)) {
        return;
      }

      const findRecordGroupIdContainingRecord = () =>
        recordGroupDefinitions.find((recordGroupDefinition) =>
          store
            .get(
              recordIndexRecordIdsByGroupCallbackFamilyState(
                recordGroupDefinition.id,
              ),
            )
            .includes(recordId),
        )?.id;

      const droppedFromRecordGroupId = findRecordGroupIdContainingRecord();

      if (!isDefined(droppedFromRecordGroupId)) {
        return;
      }

      const targetRecordGroup = recordGroupDefinitions.find(
        findByProperty('value', targetRecordGroupValue),
      );

      if (!isDefined(targetRecordGroup)) {
        return;
      }

      const targetRecordGroupId = targetRecordGroup.id;

      const recordGroupColumnName = getFieldMetadataItemGqlFieldName(
        selectFieldMetadataItem,
      );

      const isSamePosition = initialRecord.position === newPosition;

      if (
        droppedFromRecordGroupId === targetRecordGroupId &&
        (!isDefined(newPosition) || isSamePosition)
      ) {
        return;
      }

      const updateOneRecordInput = await completeRecordUpdate({
        recordId,
        updateInput: {
          [recordGroupColumnName]: targetRecordGroupValue,
          ...(isDefined(newPosition) && { position: newPosition }),
        },
      });

      if (!isDefined(updateOneRecordInput)) {
        return;
      }

      const initialRecordGroupId = findRecordGroupIdContainingRecord();

      if (!isDefined(initialRecordGroupId)) {
        return;
      }

      const movingInsideSameRecordGroup =
        initialRecordGroupId === targetRecordGroupId;

      const currentRecordIdsInInitialRecordGroup = store.get(
        recordIndexRecordIdsByGroupCallbackFamilyState(initialRecordGroupId),
      );

      const indexOfDroppedRecordInInitialRecordGroup =
        currentRecordIdsInInitialRecordGroup.findIndex((id) => id === recordId);

      let currentRecordIdsInTargetRecordGroup = store.get(
        recordIndexRecordIdsByGroupCallbackFamilyState(targetRecordGroupId),
      ) as string[];

      const newInitialGroupRecordIds =
        currentRecordIdsInInitialRecordGroup.toSpliced(
          indexOfDroppedRecordInInitialRecordGroup,
          1,
        );

      if (movingInsideSameRecordGroup) {
        currentRecordIdsInTargetRecordGroup = newInitialGroupRecordIds;
      } else {
        store.set(
          recordIndexRecordIdsByGroupCallbackFamilyState(initialRecordGroupId),
          newInitialGroupRecordIds,
        );
      }

      if (isDefined(newPosition)) {
        const targetGroupRecordsWithIds = extractRecordPositions(
          currentRecordIdsInTargetRecordGroup,
          store,
        );

        const newTargetRecordGroupWithIds = [
          ...targetGroupRecordsWithIds,
          {
            id: recordId,
            position: newPosition,
          },
        ];

        newTargetRecordGroupWithIds.sort(sortByProperty('position', 'asc'));

        store.set(
          recordIndexRecordIdsByGroupCallbackFamilyState(targetRecordGroupId),
          newTargetRecordGroupWithIds.map((record) => record.id),
        );
      } else {
        store.set(
          recordIndexRecordIdsByGroupCallbackFamilyState(targetRecordGroupId),
          [...currentRecordIdsInTargetRecordGroup, recordId],
        );
      }

      upsertRecordsInStore({
        partialRecords: [
          {
            ...initialRecord,
            id: recordId,
            __typename:
              (initialRecord as { __typename?: string })?.__typename ??
              'Record',
            [recordGroupColumnName]: targetRecordGroupValue,
            ...(isDefined(newPosition) && { position: newPosition }),
          } as ObjectRecord,
        ],
      });

      updateOneRecord({
        idToUpdate: recordId,
        updateOneRecordInput,
      });
    },
    [
      completeRecordUpdate,
      recordGroupDefinitions,
      recordIndexRecordIdsByGroupCallbackFamilyState,
      selectFieldMetadataItem,
      store,
      upsertRecordsInStore,
      updateOneRecord,
    ],
  );

  return {
    updateDroppedRecordOnBoard,
  };
};
