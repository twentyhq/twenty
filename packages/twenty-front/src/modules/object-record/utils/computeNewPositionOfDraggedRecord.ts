import { isDefined } from 'twenty-shared/utils';
import { sortByProperty } from '~/utils/array/sortByProperty';

export type RecordWithPosition = {
  id: string;
  position: number;
};

export const computeNewPositionOfDraggedRecord = ({
  arrayOfRecordsWithPosition,
  idOfItemToMove,
  idOfTargetItem,
}: {
  arrayOfRecordsWithPosition: RecordWithPosition[];
  idOfItemToMove: string;
  idOfTargetItem: string;
}) => {
  const targetItem = arrayOfRecordsWithPosition.find(
    (recordToFind) => recordToFind.id === idOfTargetItem,
  );

  if (!isDefined(targetItem)) {
    throw new Error(`Cannot find item to move for id : ${idOfTargetItem}`);
  }

  if (idOfItemToMove === idOfTargetItem) {
    return targetItem.position;
  }

  const targetPosition = targetItem.position;

  const sortedRecordsByAscendingPosition = arrayOfRecordsWithPosition.toSorted(
    sortByProperty('position'),
  );

  const indexOfItemToMove = sortedRecordsByAscendingPosition.findIndex(
    (recordToFind) => recordToFind.id === idOfItemToMove,
  );

  const itemToMoveIsNotInTable = indexOfItemToMove === -1;

  const indexOfTargetItem = sortedRecordsByAscendingPosition.findIndex(
    (recordToFind) => recordToFind.id === idOfTargetItem,
  );

  const lastIndex = sortedRecordsByAscendingPosition.length - 1;

  const shouldGoToFirstPosition = indexOfTargetItem === 0;

  const shouldGoToLastPosition = indexOfTargetItem === lastIndex;

  if (shouldGoToFirstPosition) {
    return targetPosition - 1;
  } else if (shouldGoToLastPosition) {
    return targetPosition + 1;
  } else {
    if (itemToMoveIsNotInTable) {
      const itemBeforeTargetItem =
        sortedRecordsByAscendingPosition[indexOfTargetItem - 1];

      const intermediaryPosition =
        targetItem.position -
        (targetItem.position - itemBeforeTargetItem.position) / 2;

      return intermediaryPosition;
    }

    const shouldGoAfterTargetItem = indexOfItemToMove < indexOfTargetItem;

    if (shouldGoAfterTargetItem) {
      const itemAfterTargetItem =
        sortedRecordsByAscendingPosition[indexOfTargetItem + 1];

      const intermediaryPosition =
        targetItem.position +
        (itemAfterTargetItem.position - targetItem.position) / 2;

      return intermediaryPosition;
    } else {
      const itemBeforeTargetItem =
        sortedRecordsByAscendingPosition[indexOfTargetItem - 1];

      const intermediaryPosition =
        targetItem.position -
        (targetItem.position - itemBeforeTargetItem.position) / 2;

      return intermediaryPosition;
    }
  }
};
