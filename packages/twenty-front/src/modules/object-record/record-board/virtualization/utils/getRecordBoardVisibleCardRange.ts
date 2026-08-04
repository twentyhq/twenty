// Smallest index in cardOffsets matching the predicate, or cardOffsets.length
// when none does. cardOffsets is non-decreasing so the predicate is monotonic.
const findFirstCardOffsetIndex = (
  cardOffsets: number[],
  matchesOffset: (offset: number) => boolean,
): number => {
  let low = 0;
  let high = cardOffsets.length - 1;
  let firstMatchingIndex = cardOffsets.length;

  while (low <= high) {
    const middle = Math.floor((low + high) / 2);

    if (matchesOffset(cardOffsets[middle])) {
      firstMatchingIndex = middle;
      high = middle - 1;
    } else {
      low = middle + 1;
    }
  }

  return firstMatchingIndex;
};

export const getRecordBoardVisibleCardRange = ({
  scrollTop,
  viewportHeight,
  cardsContainerOffsetTop,
  cardOffsets,
  overscanCardCount,
}: {
  scrollTop: number;
  viewportHeight: number;
  cardsContainerOffsetTop: number;
  cardOffsets: number[];
  overscanCardCount: number;
}): {
  firstCardIndexInWindow: number;
  lastCardIndexInWindow: number;
} => {
  const numberOfCards = cardOffsets.length - 1;
  const lastCardIndex = Math.max(numberOfCards - 1, 0);

  if (numberOfCards <= 0 || cardOffsets[numberOfCards] <= 0) {
    return { firstCardIndexInWindow: 0, lastCardIndexInWindow: lastCardIndex };
  }

  const viewportTopInCardsContainer = scrollTop - cardsContainerOffsetTop;
  const viewportBottomInCardsContainer =
    viewportTopInCardsContainer + viewportHeight;

  // First card whose bottom edge is below the viewport top
  const firstVisibleCardIndex =
    findFirstCardOffsetIndex(
      cardOffsets,
      (offset) => offset > viewportTopInCardsContainer,
    ) - 1;

  // Last card whose top edge is above the viewport bottom
  const lastVisibleCardIndex =
    findFirstCardOffsetIndex(
      cardOffsets,
      (offset) => offset >= viewportBottomInCardsContainer,
    ) - 1;

  const firstCardIndexInWindow = Math.min(
    Math.max(firstVisibleCardIndex - overscanCardCount, 0),
    lastCardIndex,
  );

  const lastCardIndexInWindow = Math.min(
    Math.max(lastVisibleCardIndex + overscanCardCount, firstCardIndexInWindow),
    lastCardIndex,
  );

  return { firstCardIndexInWindow, lastCardIndexInWindow };
};
