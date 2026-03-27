import { useStore } from 'jotai';

import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { extractRecordPositions } from '@/object-record/record-drag/utils/extractRecordPositions';
import { recordGroupDefinitionsComponentSelector } from '@/object-record/record-group/states/selectors/recordGroupDefinitionsComponentSelector';
import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
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
  const { updateOneRecord, selectFieldMetadataItem } =
    useContext(RecordBoardContext);

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

      if (!isDefined(newPosition)) {
        return;
      }

      if (!isDefined(initialRecord)) {
        return;
      }

      let currentRecordIdsInInitialRecordGroup: string[] = [];

      const initialRecordGroup = recordGroupDefinitions.find(
        (recordGroupDefinition) => {
          const recordIdsInGroup = store.get(
            recordIndexRecordIdsByGroupCallbackFamilyState(
              recordGroupDefinition.id,
            ),
          );

          const recordIsInGroup = recordIdsInGroup.includes(recordId);

          if (recordIsInGroup) {
            currentRecordIdsInInitialRecordGroup = recordIdsInGroup;
          }

          return recordIsInGroup;
        },
      );

      if (!isDefined(initialRecordGroup)) {
        return;
      }

      const initialRecordGroupId = initialRecordGroup.id;

      const targetRecordGroup = recordGroupDefinitions.find(
        findByProperty('value', targetRecordGroupValue),
      );

      if (!isDefined(targetRecordGroup)) {
        return;
      }

      const targetRecordGroupId = targetRecordGroup.id;

      const movingInsideSameRecordGroup =
        initialRecordGroupId === targetRecordGroupId;

      const isSamePosition = initialRecord.position === newPosition;

      if (movingInsideSameRecordGroup && isSamePosition) {
        return;
      }

      const indexOfDroppedRecordInInitialRecordGroup =
        currentRecordIdsInInitialRecordGroup.findIndex((id) => id === recordId);

      let currentRecordIdsInTargetRecordGroup = store.get(
        recordIndexRecordIdsByGroupCallbackFamilyState(targetRecordGroupId),
      ) as string[];

      if (indexOfDroppedRecordInInitialRecordGroup === -1) {
        throw new Error(
          `Cannot find record id in initial record group ids on drop, this should not happen, recordId: ${recordId}, initialRecordGroupId: ${initialRecordGroupId}`,
        );
      }

      // Snapshots for rollback if the server rejects the update
      const savedInitialGroupRecordIds = [...currentRecordIdsInInitialRecordGroup];
      const savedTargetGroupRecordIds = [...currentRecordIdsInTargetRecordGroup];

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

      upsertRecordsInStore({
        partialRecords: [
          {
            ...initialRecord,
            id: recordId,
            __typename:
              (initialRecord as { __typename?: string })?.__typename ??
              'Record',
            [selectFieldMetadataItem.name]: targetRecordGroupValue,
            position: newPosition,
          } as ObjectRecord,
        ],
      });

      let updateSucceeded = false;

      try {
        const result = await updateOneRecord({
          idToUpdate: recordId,
          updateOneRecordInput: {
            [selectFieldMetadataItem.name]: targetRecordGroupValue,
            position: newPosition,
          },
        });

        updateSucceeded = result !== null;
      } catch {
        // Error already surfaced to the user via the Apollo error toast.
      }

      if (!updateSucceeded) {
        store.set(
          recordIndexRecordIdsByGroupCallbackFamilyState(initialRecordGroupId),
          savedInitialGroupRecordIds,
        );
        store.set(
          recordIndexRecordIdsByGroupCallbackFamilyState(targetRecordGroupId),
          savedTargetGroupRecordIds,
        );
        upsertRecordsInStore({
          partialRecords: [initialRecord as ObjectRecord],
        });
      }
    },
    [
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
