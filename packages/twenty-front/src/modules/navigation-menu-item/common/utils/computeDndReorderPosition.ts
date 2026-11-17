import { getPositionBetween } from '@/navigation-menu-item/common/utils/getPositionBetween';

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
    let adjustedIndex = destinationIndex;
    if (sourceIndexInList < destinationIndex) {
      adjustedIndex -= 1;
    }
    adjustedIndex = Math.min(adjustedIndex, listWithoutDragged.length);
    const prevItem = listWithoutDragged[adjustedIndex - 1];
    const nextItem = listWithoutDragged[adjustedIndex];

    return getPositionBetween(prevItem?.position, nextItem?.position);
  }

  const prevItem = sortedList[destinationIndex - 1];
  const nextItem = sortedList[destinationIndex];

  return getPositionBetween(prevItem?.position, nextItem?.position);
};
