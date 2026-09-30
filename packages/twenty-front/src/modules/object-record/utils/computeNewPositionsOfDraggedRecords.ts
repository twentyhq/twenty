import { type RecordWithPosition } from '@/object-record/utils/computeNewPositionOfDraggedRecord';
import {
  computeEvenlySpacedPositions,
  isDefined,
} from 'twenty-shared/utils';

// TODO : refactor this
export const computeNewPositionsOfDraggedRecords = ({
  arrayOfRecordsWithPosition,
  draggedRecordId,
  targetRecordId,
  sourceRecordIds,
  isDroppedAfterList,
}: {
  arrayOfRecordsWithPosition: RecordWithPosition[];
  draggedRecordId: string;
  targetRecordId: string;
  sourceRecordIds: string[];
  isDroppedAfterList: boolean;
}): RecordWithPosition[] | null => {
  const targetItem = arrayOfRecordsWithPosition.find(
    (recordToFind) => recordToFind.id === targetRecordId,
  );

  if (!isDefined(targetItem)) {
    throw new Error(`Cannot find item to move for id : ${targetRecordId}`);
  }

  if (targetRecordId === draggedRecordId) {
    return null;
  }

  const targetPosition = targetItem.position;

  const indexOfItemToMove = arrayOfRecordsWithPosition.findIndex(
    (recordToFind) => recordToFind.id === draggedRecordId,
  );

  const itemToMoveIsNotInTable = indexOfItemToMove === -1;

  const indexOfTargetItem = arrayOfRecordsWithPosition.findIndex(
    (recordToFind) => recordToFind.id === targetRecordId,
  );

  const shouldGoToFirstPosition = indexOfTargetItem === 0;

  if (shouldGoToFirstPosition) {
    const newPositions = computeEvenlySpacedPositions({
      startingPosition: targetPosition - 1,
      endingPosition: targetPosition,
      numberOfPositions: sourceRecordIds.length,
    });

    const newSourceRecordsWithPosition: RecordWithPosition[] =
      sourceRecordIds.map((recordId, index) => ({
        id: recordId,
        position: newPositions[index],
      }));

    return newSourceRecordsWithPosition;
  } else if (isDroppedAfterList) {
    const newPositions = computeEvenlySpacedPositions({
      startingPosition: targetPosition,
      endingPosition: targetPosition + sourceRecordIds.length + 1,
      numberOfPositions: sourceRecordIds.length,
    });

    const newSourceRecordsWithPosition: RecordWithPosition[] =
      sourceRecordIds.map((recordId, index) => ({
        id: recordId,
        position: newPositions[index],
      }));

    return newSourceRecordsWithPosition;
  } else {
    if (itemToMoveIsNotInTable) {
      const itemBeforeTargetItem =
        arrayOfRecordsWithPosition[indexOfTargetItem - 1];

      const newPositions = computeEvenlySpacedPositions({
        startingPosition: itemBeforeTargetItem.position,
        endingPosition: targetItem.position,
        numberOfPositions: sourceRecordIds.length,
      });

      const newSourceRecordsWithPosition: RecordWithPosition[] =
        sourceRecordIds.map((recordId, index) => ({
          id: recordId,
          position: newPositions[index],
        }));

      return newSourceRecordsWithPosition;
    }

    const shouldGoAfterTargetItem = indexOfItemToMove < indexOfTargetItem;

    if (shouldGoAfterTargetItem) {
      const itemAfterTargetItem =
        arrayOfRecordsWithPosition[indexOfTargetItem + 1];

      const newPositions = computeEvenlySpacedPositions({
        startingPosition: targetItem.position,
        endingPosition: itemAfterTargetItem.position,
        numberOfPositions: sourceRecordIds.length,
      });

      const newSourceRecordsWithPosition: RecordWithPosition[] =
        sourceRecordIds.map((recordId, index) => ({
          id: recordId,
          position: newPositions[index],
        }));

      return newSourceRecordsWithPosition;
    } else {
      const itemBeforeTargetItem =
        arrayOfRecordsWithPosition[indexOfTargetItem - 1];

      const newPositions = computeEvenlySpacedPositions({
        startingPosition: itemBeforeTargetItem.position,
        endingPosition: targetItem.position,
        numberOfPositions: sourceRecordIds.length,
      });

      const newSourceRecordsWithPosition: RecordWithPosition[] =
        sourceRecordIds.map((recordId, index) => ({
          id: recordId,
          position: newPositions[index],
        }));

      return newSourceRecordsWithPosition;
    }
  }
};
