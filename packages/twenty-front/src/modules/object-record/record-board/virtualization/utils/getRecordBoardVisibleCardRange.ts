export const getRecordBoardVisibleCardRange = ({
  scrollTop,
  viewportHeight,
  cardsContainerOffsetTop,
  cardSlotHeight,
  numberOfCards,
  overscanCardCount,
}: {
  scrollTop: number;
  viewportHeight: number;
  cardsContainerOffsetTop: number;
  cardSlotHeight: number;
  numberOfCards: number;
  overscanCardCount: number;
}): {
  firstCardIndexInWindow: number;
  lastCardIndexInWindow: number;
} => {
  const lastCardIndex = Math.max(numberOfCards - 1, 0);

  if (numberOfCards <= 0 || cardSlotHeight <= 0) {
    return { firstCardIndexInWindow: 0, lastCardIndexInWindow: lastCardIndex };
  }

  const viewportTopInCardsContainer = scrollTop - cardsContainerOffsetTop;
  const viewportBottomInCardsContainer =
    viewportTopInCardsContainer + viewportHeight;

  const firstVisibleCardIndex = Math.floor(
    viewportTopInCardsContainer / cardSlotHeight,
  );
  const lastVisibleCardIndex = Math.floor(
    viewportBottomInCardsContainer / cardSlotHeight,
  );

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
