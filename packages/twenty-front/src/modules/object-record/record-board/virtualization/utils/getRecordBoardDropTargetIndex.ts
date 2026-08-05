// Same midpoint rule as resolveDropTarget: a pointer above a card's middle
// drops before it, below drops after it. Cards hidden behind window
// placeholders are located through their cumulative offsets.
export const getRecordBoardDropTargetIndex = ({
  pointerY,
  cardsContainerTop,
  cardOffsets,
}: {
  pointerY: number;
  cardsContainerTop: number;
  cardOffsets: number[];
}): number => {
  const numberOfCards = cardOffsets.length - 1;
  const pointerYInCardsContainer = pointerY - cardsContainerTop;

  let low = 0;
  let high = numberOfCards - 1;
  let dropTargetIndex = numberOfCards;

  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    const cardMidpointY = (cardOffsets[middle] + cardOffsets[middle + 1]) / 2;

    if (pointerYInCardsContainer < cardMidpointY) {
      dropTargetIndex = middle;
      high = middle - 1;
    } else {
      low = middle + 1;
    }
  }

  return dropTargetIndex;
};
