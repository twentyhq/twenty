import { type DropResult } from '@hello-pangea/dnd';
import { type Snapshot } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';

import { processSingleDrag } from '@/object-record/record-drag/shared/utils/processSingleDrag';
import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { extractRecordPositions } from './extractRecordPositions';
import { getDragOperationType } from './getDragOperationType';
import { processMultiDrag } from './processMultiDrag';

type ProcessGroupDragOperationParams = {
  result: DropResult;
  snapshot: Snapshot;
  selectedRecordIds: string[];
  recordIdsByGroupFamilyState: any;
  onUpdateRecord: (
    update: { recordId: string; position?: number },
    targetRecordGroupId: RecordGroupDefinition['value'],
  ) => void;
};

export const processGroupDragOperation = ({
  result,
  snapshot,
  selectedRecordIds,
  recordIdsByGroupFamilyState,
  onUpdateRecord,
}: ProcessGroupDragOperationParams) => {
  if (!result.destination) {
    return;
  }

  const destinationGroupId = result.destination.droppableId;

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

  const recordsWithPosition = extractRecordPositions(
    destinationRecordIds,
    snapshot,
  );

  const draggedRecordId = result.draggableId;
  const dragOperationType = getDragOperationType({
    draggedRecordId,
    selectedRecordIds,
  });

  const destinationIndex = result.destination.index;

  const isDroppedAfterList = destinationIndex >= recordsWithPosition.length;

  const targetRecord = isDroppedAfterList
    ? recordsWithPosition.at(-1)
    : recordsWithPosition.at(result.destination.index);

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
