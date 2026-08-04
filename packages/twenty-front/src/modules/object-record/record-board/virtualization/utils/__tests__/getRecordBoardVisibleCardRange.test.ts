import { getRecordBoardVisibleCardRange } from '@/object-record/record-board/virtualization/utils/getRecordBoardVisibleCardRange';

describe('getRecordBoardVisibleCardRange', () => {
  it('should window the cards intersecting the viewport with overscan', () => {
    expect(
      getRecordBoardVisibleCardRange({
        scrollTop: 1000,
        viewportHeight: 500,
        cardsContainerOffsetTop: 100,
        cardSlotHeight: 100,
        numberOfCards: 100,
        overscanCardCount: 2,
      }),
    ).toEqual({
      firstCardIndexInWindow: 7,
      lastCardIndexInWindow: 16,
    });
  });

  it('should clamp the window at the start of the column', () => {
    expect(
      getRecordBoardVisibleCardRange({
        scrollTop: 0,
        viewportHeight: 500,
        cardsContainerOffsetTop: 0,
        cardSlotHeight: 100,
        numberOfCards: 100,
        overscanCardCount: 10,
      }),
    ).toEqual({
      firstCardIndexInWindow: 0,
      lastCardIndexInWindow: 15,
    });
  });

  it('should clamp the window at the end of the column', () => {
    expect(
      getRecordBoardVisibleCardRange({
        scrollTop: 9500,
        viewportHeight: 500,
        cardsContainerOffsetTop: 0,
        cardSlotHeight: 100,
        numberOfCards: 100,
        overscanCardCount: 10,
      }),
    ).toEqual({
      firstCardIndexInWindow: 85,
      lastCardIndexInWindow: 99,
    });
  });

  it('should keep the first cards in the window when the column is below the viewport', () => {
    expect(
      getRecordBoardVisibleCardRange({
        scrollTop: 0,
        viewportHeight: 500,
        cardsContainerOffsetTop: 10000,
        cardSlotHeight: 100,
        numberOfCards: 100,
        overscanCardCount: 10,
      }),
    ).toEqual({
      firstCardIndexInWindow: 0,
      lastCardIndexInWindow: 0,
    });
  });

  it('should return the full range when the card slot height is not measurable', () => {
    expect(
      getRecordBoardVisibleCardRange({
        scrollTop: 1000,
        viewportHeight: 500,
        cardsContainerOffsetTop: 0,
        cardSlotHeight: 0,
        numberOfCards: 100,
        overscanCardCount: 10,
      }),
    ).toEqual({
      firstCardIndexInWindow: 0,
      lastCardIndexInWindow: 99,
    });
  });
});
