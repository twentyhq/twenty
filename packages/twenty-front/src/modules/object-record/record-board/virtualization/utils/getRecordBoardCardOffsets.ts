// Cumulative card top offsets within a column, with one extra trailing entry
// holding the total height, so cardOffsets[index + 1] - cardOffsets[index]
// is the slot height of the card at index.
export const getRecordBoardCardOffsets = ({
  recordIds,
  cardHeightByRecordId,
  estimatedCardHeight,
}: {
  recordIds: string[];
  cardHeightByRecordId: Record<string, number>;
  estimatedCardHeight: number;
}): number[] => {
  const cardOffsets = new Array<number>(recordIds.length + 1);
  cardOffsets[0] = 0;

  recordIds.forEach((recordId, cardIndex) => {
    const cardHeight = cardHeightByRecordId[recordId] ?? estimatedCardHeight;

    cardOffsets[cardIndex + 1] = cardOffsets[cardIndex] + cardHeight;
  });

  return cardOffsets;
};
