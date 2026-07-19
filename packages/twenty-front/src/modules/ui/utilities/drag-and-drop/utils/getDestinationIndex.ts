// In same-column moves the source card is removed first, so gaps after it
// shift down by one; convert the gap index into the final array index.
export const getDestinationIndex = ({
  dropTargetIndex,
  sourceIndex,
  sourceDroppableId,
  destinationDroppableId,
}: {
  dropTargetIndex: number;
  sourceIndex: number;
  sourceDroppableId: string;
  destinationDroppableId: string;
}) => {
  const isSameColumn = sourceDroppableId === destinationDroppableId;

  if (!isSameColumn) {
    return dropTargetIndex;
  }

  return dropTargetIndex > sourceIndex ? dropTargetIndex - 1 : dropTargetIndex;
};
