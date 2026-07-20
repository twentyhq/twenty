import type { Store } from 'jotai/vanilla/store';
import { isDefined } from 'twenty-shared/utils';

import { processSingleDrag } from '@/object-record/record-drag/utils/processSingleDrag';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { extractRecordPositions } from './extractRecordPositions';
import { getDragOperationType } from './getDragOperationType';
import { processMultiDrag } from './processMultiDrag';

type ProcessGroupDropParams = {
  droppableId: string;
  draggableId: string;
  targetIndex: number;
  store: Store;
  selectedRecordIds: string[];
  recordIdsByGroupFamilyState: any;
  onUpdateRecord: (
    update: {
      recordId: string;
      position?: number;
    },
    targetRecordGroupId: RecordGroupDefinition['value'],
  ) => void;
};

export const processGroupDrop = ({
  droppableId,
  draggableId,
  targetIndex,
  store,
  selectedRecordIds,
  recordIdsByGroupFamilyState,
  onUpdateRecord,
}: ProcessGroupDropParams) => {
  const recordGroup = store.get(
    recordGroupDefinitionFamilyState.atomFamily(droppableId),
  );

  if (!isDefined(recordGroup)) {
    throw new Error('Record group is not defined');
  }

  const targetRecordIds = store.get(
    recordIdsByGroupFamilyState(droppableId),
  ) as string[];

  const dragOperationType = getDragOperationType({
    draggedRecordId: draggableId,
    selectedRecordIds,
  });

  const targetGroupIsEmpty = targetRecordIds.length === 0;

  if (targetGroupIsEmpty) {
    if (dragOperationType === 'single') {
      onUpdateRecord(
        {
          recordId: draggableId,
          position: 1,
        },
        recordGroup.value,
      );
    } else {
      for (const [index, selectedRecordId] of selectedRecordIds.entries()) {
        onUpdateRecord(
          {
            recordId: selectedRecordId,
            position: index + 1,
          },
          recordGroup.value,
        );
      }
    }

    return;
  }

  const recordsWithPosition = extractRecordPositions(targetRecordIds, store);

  const isDroppedAfterList = targetIndex >= recordsWithPosition.length;

  const targetRecord = isDroppedAfterList
    ? recordsWithPosition.at(-1)
    : recordsWithPosition.at(targetIndex);

  if (!isDefined(targetRecord)) {
    throw new Error(
      `targetRecord cannot be found in passed recordsWithPosition, this should not happen.`,
    );
  }

  if (dragOperationType === 'single') {
    const singleDragResult = processSingleDrag({
      sourceRecordId: draggableId,
      targetRecordId: targetRecord.id,
      recordsWithPosition: recordsWithPosition,
      isDroppedAfterList,
    });

    if (!isDefined(singleDragResult.position)) {
      return;
    }

    onUpdateRecord(
      {
        recordId: singleDragResult.id,
        position: singleDragResult.position,
      },
      recordGroup.value,
    );
  } else {
    const multiDragResult = processMultiDrag({
      draggedRecordId: draggableId,
      selectedRecordIds,
      recordsWithPosition,
      targetRecordId: targetRecord.id,
      isDroppedAfterList,
    });

    for (const update of multiDragResult.recordUpdates) {
      onUpdateRecord(
        {
          recordId: update.id,
          position: update.position,
        },
        recordGroup.value,
      );
    }
  }
};
