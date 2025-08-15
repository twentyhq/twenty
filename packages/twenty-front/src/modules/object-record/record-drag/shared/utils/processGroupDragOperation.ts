import { type DropResult } from '@hello-pangea/dnd';
import { type Snapshot } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';

import { extractRecordPositions } from './extractRecordPositions';
import { getDragOperationType } from './getDragOperationType';
import { processMultiDrag } from './processMultiDrag';
import { processSingleDrag } from './processSingleDrag';

type ProcessGroupDragOperationParams = {
  result: DropResult;
  snapshot: Snapshot;
  selectedRecordIds: string[];
  selectFieldName: string;
  recordIdsByGroupFamilyState: any;
  onUpdateRecord: (update: {
    recordId: string;
    position?: number;
    groupValue?: string | null;
    selectFieldName: string;
  }) => void;
};

export const processGroupDragOperation = ({
  result,
  snapshot,
  selectedRecordIds,
  selectFieldName,
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

  const recordPositionData = extractRecordPositions(
    destinationRecordIds,
    snapshot,
  );

  const draggedRecordId = result.draggableId;
  const dragOperationType = getDragOperationType({
    draggedRecordId,
    selectedRecordIds,
  });

  if (dragOperationType === 'single') {
    const singleDragResult = processSingleDrag({
      result,
      recordPositionData,
      recordIds: destinationRecordIds,
      groupValue: recordGroup.value,
      selectFieldName,
    });

    if (!isDefined(singleDragResult.position)) {
      return;
    }

    onUpdateRecord({
      recordId: singleDragResult.recordId,
      position: singleDragResult.position,
      groupValue: recordGroup.value,
      selectFieldName,
    });
  } else {
    const multiDragResult = processMultiDrag({
      result,
      selectedRecordIds,
      recordPositionData,
      recordIds: destinationRecordIds,
      groupValue: recordGroup.value,
      selectFieldName,
    });

    for (const update of multiDragResult.recordUpdates) {
      onUpdateRecord({
        recordId: update.recordId,
        position: update.position,
        groupValue: recordGroup.value,
        selectFieldName,
      });
    }
  }
};
