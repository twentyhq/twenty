type AdjustDestinationIndexForDragParams = {
  sourceDroppableId: string;
  destinationDroppableId: string;
  sourceIndex: number;
  destinationIndex: number;
};

export const adjustDestinationIndexForDrag = ({
  sourceDroppableId,
  destinationDroppableId,
  sourceIndex,
  destinationIndex,
}: AdjustDestinationIndexForDragParams): number => {
  const movingBetweenDroppables = sourceDroppableId !== destinationDroppableId;

  if (movingBetweenDroppables && destinationIndex > sourceIndex) {
    return destinationIndex - 1;
  }

  return destinationIndex;
};
