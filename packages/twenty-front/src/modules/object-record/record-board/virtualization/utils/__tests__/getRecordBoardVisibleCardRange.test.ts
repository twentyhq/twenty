import { getRecordBoardVisibleCardRange } from '@/object-record/record-board/virtualization/utils/getRecordBoardVisibleCardRange';

const getUniformCardOffsets = (numberOfCards: number, cardHeight: number) =>
  Array.from(
    { length: numberOfCards + 1 },
    (_, offsetIndex) => offsetIndex * cardHeight,
  );

describe('getRecordBoardVisibleCardRange', () => {
  it('should window the cards intersecting the viewport with overscan', () => {
    expect(
      getRecordBoardVisibleCardRange({
        scrollTop: 1000,
        viewportHeight: 500,
        cardsContainerOffsetTop: 100,
        cardOffsets: getUniformCardOffsets(100, 100),
        overscanCardCount: 2,
      }),
    ).toEqual({
      firstCardIndexInWindow: 7,
      lastCardIndexInWindow: 15,
    });
  });

  it('should window variable-height cards from their cumulative offsets', () => {
    expect(
      getRecordBoardVisibleCardRange({
        scrollTop: 100,
        viewportHeight: 150,
        cardsContainerOffsetTop: 0,
        cardOffsets: [0, 50, 150, 300, 500],
        overscanCardCount: 0,
      }),
    ).toEqual({
      firstCardIndexInWindow: 1,
      lastCardIndexInWindow: 2,
    });
  });

  it('should clamp the window at the start of the column', () => {
    expect(
      getRecordBoardVisibleCardRange({
        scrollTop: 0,
        viewportHeight: 500,
        cardsContainerOffsetTop: 0,
        cardOffsets: getUniformCardOffsets(100, 100),
        overscanCardCount: 10,
      }),
    ).toEqual({
      firstCardIndexInWindow: 0,
      lastCardIndexInWindow: 14,
    });
  });

  it('should clamp the window at the end of the column', () => {
    expect(
      getRecordBoardVisibleCardRange({
        scrollTop: 9500,
        viewportHeight: 500,
        cardsContainerOffsetTop: 0,
        cardOffsets: getUniformCardOffsets(100, 100),
        overscanCardCount: 10,
      }),
    ).toEqual({
      firstCardIndexInWindow: 85,
      lastCardIndexInWindow: 99,
    });
  });

  it('should overscan from the first cards when the column is below the viewport', () => {
    expect(
      getRecordBoardVisibleCardRange({
        scrollTop: 0,
        viewportHeight: 500,
        cardsContainerOffsetTop: 10000,
        cardOffsets: getUniformCardOffsets(100, 100),
        overscanCardCount: 10,
      }),
    ).toEqual({
      firstCardIndexInWindow: 0,
      lastCardIndexInWindow: 9,
    });
  });

  it('should return the full range when the total height is not measurable', () => {
    expect(
      getRecordBoardVisibleCardRange({
        scrollTop: 1000,
        viewportHeight: 500,
        cardsContainerOffsetTop: 0,
        cardOffsets: getUniformCardOffsets(100, 0),
        overscanCardCount: 10,
      }),
    ).toEqual({
      firstCardIndexInWindow: 0,
      lastCardIndexInWindow: 99,
    });
  });
});
