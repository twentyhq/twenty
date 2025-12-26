import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { extractRecordPositions } from '@/object-record/record-drag/utils/extractRecordPositions';
import { recordGroupDefinitionsComponentSelector } from '@/object-record/record-group/states/selectors/recordGroupDefinitionsComponentSelector';
import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';
import { findByProperty, isDefined } from 'twenty-shared/utils';
import { sortByProperty } from '~/utils/array/sortByProperty';

export const useUpdateDroppedRecordOnBoard = () => {
  const { updateOneRecord, selectFieldMetadataItem } =
    useContext(RecordBoardContext);

  const recordIndexRecordIdsByGroupCallbackFamilyState =
    useRecoilComponentCallbackState(
      recordIndexRecordIdsByGroupComponentFamilyState,
    );

  const recordGroupDefinitions = useRecoilComponentValue(
    recordGroupDefinitionsComponentSelector,
  );

  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const updateDroppedRecordOnBoard = useRecoilCallback(
    ({ snapshot, set }) =>
      (
        {
          recordId,
          position: newPosition,
        }: { recordId: string; position?: number },
        targetRecordGroupValue: RecordGroupDefinition['value'],
      ) => {
        const initialRecord = getSnapshotValue(
          snapshot,
          recordStoreFamilyState(recordId),
        );

        if (!isDefined(newPosition)) {
          return;
        }

        if (!isDefined(initialRecord)) {
          return;
        }

        const initialRecordGroupValue =
          initialRecord[selectFieldMetadataItem.name];

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

        const currentRecordIdsInInitialRecordGroup = getSnapshotValue(
          snapshot,
          recordIndexRecordIdsByGroupCallbackFamilyState(initialRecordGroupId),
        );

        const positionOfDroppedRecordInInitialRecordIds =
          currentRecordIdsInInitialRecordGroup.findIndex(
            (id) => id === recordId,
          );

        let currentRecordIdsInTargetRecordGroup = getSnapshotValue(
          snapshot,
          recordIndexRecordIdsByGroupCallbackFamilyState(targetRecordGroupId),
        );

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
          set(
            recordIndexRecordIdsByGroupCallbackFamilyState(
              initialRecordGroupId,
            ),
            newInitialGroupRecordIds,
          );
        }

        const targetGroupRecordsWithIds = extractRecordPositions(
          currentRecordIdsInTargetRecordGroup,
          snapshot,
        );

        const newTargetRecordGroupWithIds = [
          ...targetGroupRecordsWithIds,
          {
            id: recordId,
            position: newPosition,
          },
        ];

        newTargetRecordGroupWithIds.sort(sortByProperty('position', 'asc'));

        set(
          recordIndexRecordIdsByGroupCallbackFamilyState(targetRecordGroupId),
          newTargetRecordGroupWithIds.map((record) => record.id),
        );

        upsertRecordsInStore({
          partialRecords: [
            {
              ...initialRecord,
              [selectFieldMetadataItem.name]: targetRecordGroupValue,
              position: newPosition,
            },
          ],
        });

        updateOneRecord({
          idToUpdate: initialRecord.id,
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
      upsertRecordsInStore,
      updateOneRecord,
    ],
  );

  return {
    updateDroppedRecordOnBoard,
  };
};
