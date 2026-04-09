import { computeNewEvenlySpacedPositions } from '@/object-record/utils/computeNewEvenlySpacedPositions';
import { type RecordWithPosition } from '@/object-record/utils/computeNewPositionOfDraggedRecord';
import { isDefined } from 'twenty-shared/utils';

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
    const newPositions = computeNewEvenlySpacedPositions({
      startingPosition: targetPosition - 1,
      endingPosition: targetPosition,
      numberOfRecordsToInsertBetween: sourceRecordIds.length,
    });

    const newSourceRecordsWithPosition: RecordWithPosition[] =
      sourceRecordIds.map((recordId, index) => ({
        id: recordId,
        position: newPositions[index],
      }));

    return newSourceRecordsWithPosition;
  } else if (isDroppedAfterList) {
    const newPositions = computeNewEvenlySpacedPositions({
      startingPosition: targetPosition,
      endingPosition: targetPosition + sourceRecordIds.length + 1,
      numberOfRecordsToInsertBetween: sourceRecordIds.length,
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

      const newPositions = computeNewEvenlySpacedPositions({
        startingPosition: itemBeforeTargetItem.position,
        endingPosition: targetItem.position,
        numberOfRecordsToInsertBetween: sourceRecordIds.length,
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

      const newPositions = computeNewEvenlySpacedPositions({
        startingPosition: targetItem.position,
        endingPosition: itemAfterTargetItem.position,
        numberOfRecordsToInsertBetween: sourceRecordIds.length,
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

      const newPositions = computeNewEvenlySpacedPositions({
        startingPosition: itemBeforeTargetItem.position,
        endingPosition: targetItem.position,
        numberOfRecordsToInsertBetween: sourceRecordIds.length,
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
