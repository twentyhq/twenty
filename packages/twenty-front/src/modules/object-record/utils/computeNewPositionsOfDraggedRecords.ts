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

  const assignPositionsToSourceRecords = ({
    startingPosition,
    endingPosition,
  }: {
    startingPosition: number;
    endingPosition: number;
  }): RecordWithPosition[] => {
    const newPositions = computeNewEvenlySpacedPositions({
      startingPosition,
      endingPosition,
      numberOfRecordsToInsertBetween: sourceRecordIds.length,
    });

    return sourceRecordIds.flatMap((recordId, index) => {
      const position = newPositions[index];

      return isDefined(position) ? [{ id: recordId, position }] : [];
    });
  };

  const itemBeforeTargetItem =
    arrayOfRecordsWithPosition[indexOfTargetItem - 1];
  const itemAfterTargetItem = arrayOfRecordsWithPosition[indexOfTargetItem + 1];

  if (shouldGoToFirstPosition) {
    return assignPositionsToSourceRecords({
      startingPosition: targetPosition - 1,
      endingPosition: targetPosition,
    });
  }

  if (isDroppedAfterList) {
    return assignPositionsToSourceRecords({
      startingPosition: targetPosition,
      endingPosition: targetPosition + sourceRecordIds.length + 1,
    });
  }

  const shouldGoAfterTargetItem =
    !itemToMoveIsNotInTable && indexOfItemToMove < indexOfTargetItem;

  if (shouldGoAfterTargetItem) {
    return assignPositionsToSourceRecords({
      startingPosition: targetPosition,
      endingPosition:
        itemAfterTargetItem?.position ??
        targetPosition + sourceRecordIds.length + 1,
    });
  }

  return assignPositionsToSourceRecords({
    startingPosition: itemBeforeTargetItem?.position ?? targetPosition - 1,
    endingPosition: targetPosition,
  });
};
