import { type DropResult } from '@hello-pangea/dnd';
import { type Snapshot } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';

import { processSingleDrag } from '@/object-record/record-drag/utils/processSingleDrag';
import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { extractRecordPositions } from './extractRecordPositions';
import { getDragOperationType } from './getDragOperationType';
import { processMultiDrag } from './processMultiDrag';

type ProcessGroupDropParams = {
  groupDropResult: DropResult;
  snapshot: Snapshot;
  selectedRecordIds: string[];
  recordIdsByGroupFamilyState: any;
  onUpdateRecord: (
    update: { recordId: string; position?: number },
    targetRecordGroupId: RecordGroupDefinition['value'],
  ) => void;
};

export const processGroupDrop = ({
  groupDropResult,
  snapshot,
  selectedRecordIds,
  recordIdsByGroupFamilyState,
  onUpdateRecord,
}: ProcessGroupDropParams) => {
  if (!groupDropResult.destination) {
    return;
  }

  const destinationGroupId = groupDropResult.destination.droppableId;

  const recordGroup = getSnapshotValue(
    snapshot,
    recordGroupDefinitionFamilyState(destinationGroupId),
  );

  if (!isDefined(recordGroup)) {
    throw new Error('Record group is not defined');
  }

  const destinationRecordIds = getSnapshotValue(
    snapshot,
    recordIdsByGroupFamilyState(destinationGroupId),
  ) as string[];

  const draggedRecordId = groupDropResult.draggableId;

  const dragOperationType = getDragOperationType({
    draggedRecordId,
    selectedRecordIds,
  });

  const targetGroupIsEmpty = destinationRecordIds.length === 0;

  if (targetGroupIsEmpty) {
    if (dragOperationType === 'single') {
      onUpdateRecord(
        {
          recordId: draggedRecordId,
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

  const recordsWithPosition = extractRecordPositions(
    destinationRecordIds,
    snapshot,
  );

  const destinationIndex = groupDropResult.destination.index;

  const isDroppedAfterList = destinationIndex >= recordsWithPosition.length;

  const targetRecord = isDroppedAfterList
    ? recordsWithPosition.at(-1)
    : recordsWithPosition.at(groupDropResult.destination.index);

  if (!isDefined(targetRecord)) {
    throw new Error(
      `targetRecord cannot be found in passed recordsWithPosition, this should not happen.`,
    );
  }

  if (dragOperationType === 'single') {
    const singleDragResult = processSingleDrag({
      sourceRecordId: draggedRecordId,
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
      draggedRecordId,
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
