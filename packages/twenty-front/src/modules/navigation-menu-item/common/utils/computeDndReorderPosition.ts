import { getPositionBetween } from '@/navigation-menu-item/common/utils/getPositionBetween';

// Computes the new position for a dragged item in a sorted list.
// Handles the DnD kit index offset: when dragging downward in the
// same list, the destination index doesn't account for the dragged
// item being visually removed, so we adjust by -1.
export const computeDndReorderPosition = ({
  sortedList,
  draggableId,
  destinationIndex,
}: {
  sortedList: Array<{ id: string; position: number }>;
  draggableId: string;
  destinationIndex: number;
}): number => {
  const sourceIndexInList = sortedList.findIndex(
    (item) => item.id === draggableId,
  );
  const isSameList = sourceIndexInList >= 0;

  if (isSameList) {
    const listWithoutDragged = sortedList.filter(
      (item) => item.id !== draggableId,
    );
    const adjustedIndex =
      sourceIndexInList < destinationIndex &&
      destinationIndex <= listWithoutDragged.length
        ? destinationIndex - 1
        : destinationIndex;
    const prevItem = listWithoutDragged[adjustedIndex - 1];
    const nextItem = listWithoutDragged[adjustedIndex];

    return getPositionBetween(prevItem?.position, nextItem?.position);
  }

  const prevItem = sortedList[destinationIndex - 1];
  const nextItem = sortedList[destinationIndex];

  return getPositionBetween(prevItem?.position, nextItem?.position);
};
