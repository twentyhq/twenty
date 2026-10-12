import type { Store } from 'jotai/vanilla/store';
import { isDefined } from 'twenty-shared/utils';

import { extractRecordPositions } from '@/object-record/record-drag/utils/extractRecordPositions';
import {
  computeNewPositionOfDraggedRecord,
  type RecordWithPosition,
} from '@/object-record/utils/computeNewPositionOfDraggedRecord';
import { computeNewPositionsOfDraggedRecords } from '@/object-record/utils/computeNewPositionsOfDraggedRecords';

type ComputeDroppedRecordPositionsArgs = {
  destinationRecordIds: string[];
  destinationIndex: number;
  draggedRecordId: string;
  draggedRecordIds: string[];
  store: Store;
};

export const computeDroppedRecordPositions = ({
  destinationRecordIds,
  destinationIndex,
  draggedRecordId,
  draggedRecordIds,
  store,
}: ComputeDroppedRecordPositionsArgs): RecordWithPosition[] => {
  if (destinationRecordIds.length === 0) {
    return draggedRecordIds.map((recordId, index) => ({
      id: recordId,
      position: index + 1,
    }));
  }

  const isDroppedAfterList = destinationIndex >= destinationRecordIds.length;

  const targetRecordId = isDroppedAfterList
    ? destinationRecordIds.at(-1)
    : destinationRecordIds.at(destinationIndex);

  if (!isDefined(targetRecordId)) {
    throw new Error('Target record id cannot be found, this should not happen');
  }

  const recordsWithPosition = extractRecordPositions(
    destinationRecordIds.filter(isDefined),
    store,
  );

  if (draggedRecordIds.length > 1) {
    return computeNewPositionsOfDraggedRecords({
      arrayOfRecordsWithPosition: recordsWithPosition,
      draggedRecordId,
      targetRecordId,
      sourceRecordIds: draggedRecordIds,
      isDroppedAfterList,
    });
  }

  return [
    {
      id: draggedRecordId,
      position: computeNewPositionOfDraggedRecord({
        arrayOfRecordsWithPosition: recordsWithPosition,
        idOfItemToMove: draggedRecordId,
        idOfTargetItem: targetRecordId,
        isDroppedAfterList,
      }),
    },
  ];
};
