import { useStore } from 'jotai';

import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { extractRecordPositions } from '@/object-record/record-drag/utils/extractRecordPositions';
import { recordGroupDefinitionsComponentSelector } from '@/object-record/record-group/states/selectors/recordGroupDefinitionsComponentSelector';
import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
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
    (
      {
        recordId,
        position: newPosition,
      }: { recordId: string; position?: number },
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

      const initialRecordGroupValue = initialRecord[
        selectFieldMetadataItem.name
      ] as string | undefined;

      const initialRecordGroup = recordGroupDefinitions.find(
        findByProperty('value', initialRecordGroupValue),
      );

      if (!isDefined(initialRecordGroup)) {
        return;
      }

      const targetRecordGroup = recordGroupDefinitions.find(
        findByProperty('value', targetRecordGroupValue),
      );

      if (!isDefined(targetRecordGroup)) {
        return;
      }

      const initialRecordGroupId = initialRecordGroup.id;
      const targetRecordGroupId = targetRecordGroup.id;

      const movingInsideSameRecordGroup =
        initialRecordGroupId === targetRecordGroupId;

      const isSamePosition = initialRecord.position === newPosition;

      if (movingInsideSameRecordGroup && isSamePosition) {
        return;
      }

      const currentRecordIdsInInitialRecordGroup = store.get(
        recordIndexRecordIdsByGroupCallbackFamilyState(initialRecordGroupId),
      ) as string[];

      const positionOfDroppedRecordInInitialRecordIds =
        currentRecordIdsInInitialRecordGroup.findIndex((id) => id === recordId);

      let currentRecordIdsInTargetRecordGroup = store.get(
        recordIndexRecordIdsByGroupCallbackFamilyState(targetRecordGroupId),
      ) as string[];

      if (positionOfDroppedRecordInInitialRecordIds === -1) {
        throw new Error(
          `Cannot find record id in initial record group ids on drop, this should not happen`,
        );
      }

      const newInitialGroupRecordIds =
        currentRecordIdsInInitialRecordGroup.toSpliced(
          positionOfDroppedRecordInInitialRecordIds,
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

      updateOneRecord({
        idToUpdate: recordId,
        updateOneRecordInput: {
          [selectFieldMetadataItem.name]: targetRecordGroupValue,
          position: newPosition,
        },
      });
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
