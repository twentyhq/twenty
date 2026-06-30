export const getBoardCardDropBehavior = ({
  hasRecordSorts,
  sourceDroppableId,
  destinationDroppableId,
}: {
  hasRecordSorts: boolean;
  sourceDroppableId: string;
  destinationDroppableId: string;
}) => {
  const isMovingInsideSameRecordGroup =
    sourceDroppableId === destinationDroppableId;

  return {
    shouldBlockDrop: hasRecordSorts && isMovingInsideSameRecordGroup,
    shouldUpdatePosition: !hasRecordSorts,
  };
};
