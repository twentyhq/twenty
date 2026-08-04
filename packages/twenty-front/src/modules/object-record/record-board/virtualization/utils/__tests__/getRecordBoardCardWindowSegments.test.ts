import { getRecordBoardCardWindowSegments } from '@/object-record/record-board/virtualization/utils/getRecordBoardCardWindowSegments';

describe('getRecordBoardCardWindowSegments', () => {
  it('should return a single cards segment when the window covers all cards', () => {
    expect(
      getRecordBoardCardWindowSegments({
        numberOfCards: 10,
        firstCardIndexInWindow: 0,
        lastCardIndexInWindow: 9,
      }),
    ).toEqual([{ type: 'cards', firstCardIndex: 0, lastCardIndex: 9 }]);
  });

  it('should surround a middle window with placeholders', () => {
    expect(
      getRecordBoardCardWindowSegments({
        numberOfCards: 100,
        firstCardIndexInWindow: 40,
        lastCardIndexInWindow: 60,
      }),
    ).toEqual([
      { type: 'placeholder', firstCardIndex: 0, lastCardIndex: 39 },
      { type: 'cards', firstCardIndex: 40, lastCardIndex: 60 },
      { type: 'placeholder', firstCardIndex: 61, lastCardIndex: 99 },
    ]);
  });

  it('should split placeholders around forced cards outside the window', () => {
    expect(
      getRecordBoardCardWindowSegments({
        numberOfCards: 100,
        firstCardIndexInWindow: 40,
        lastCardIndexInWindow: 60,
        forcedCardIndexes: [5],
      }),
    ).toEqual([
      { type: 'placeholder', firstCardIndex: 0, lastCardIndex: 4 },
      { type: 'cards', firstCardIndex: 5, lastCardIndex: 5 },
      { type: 'placeholder', firstCardIndex: 6, lastCardIndex: 39 },
      { type: 'cards', firstCardIndex: 40, lastCardIndex: 60 },
      { type: 'placeholder', firstCardIndex: 61, lastCardIndex: 99 },
    ]);
  });

  it('should merge forced cards adjacent to the window into its cards segment', () => {
    expect(
      getRecordBoardCardWindowSegments({
        numberOfCards: 100,
        firstCardIndexInWindow: 40,
        lastCardIndexInWindow: 60,
        forcedCardIndexes: [39, 61],
      }),
    ).toEqual([
      { type: 'placeholder', firstCardIndex: 0, lastCardIndex: 38 },
      { type: 'cards', firstCardIndex: 39, lastCardIndex: 61 },
      { type: 'placeholder', firstCardIndex: 62, lastCardIndex: 99 },
    ]);
  });

  it('should ignore forced cards outside the list bounds', () => {
    expect(
      getRecordBoardCardWindowSegments({
        numberOfCards: 10,
        firstCardIndexInWindow: 0,
        lastCardIndexInWindow: 9,
        forcedCardIndexes: [-1, 10],
      }),
    ).toEqual([{ type: 'cards', firstCardIndex: 0, lastCardIndex: 9 }]);
  });

  it('should clamp a stale window that exceeds the list bounds', () => {
    expect(
      getRecordBoardCardWindowSegments({
        numberOfCards: 10,
        firstCardIndexInWindow: 40,
        lastCardIndexInWindow: 60,
      }),
    ).toEqual([
      { type: 'placeholder', firstCardIndex: 0, lastCardIndex: 8 },
      { type: 'cards', firstCardIndex: 9, lastCardIndex: 9 },
    ]);
  });

  it('should return no segments for an empty list', () => {
    expect(
      getRecordBoardCardWindowSegments({
        numberOfCards: 0,
        firstCardIndexInWindow: 0,
        lastCardIndexInWindow: 0,
      }),
    ).toEqual([]);
  });
});
