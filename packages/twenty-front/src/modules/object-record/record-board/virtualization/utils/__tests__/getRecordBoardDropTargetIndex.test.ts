import { getRecordBoardDropTargetIndex } from '@/object-record/record-board/virtualization/utils/getRecordBoardDropTargetIndex';

describe('getRecordBoardDropTargetIndex', () => {
  it('should drop before a card when the pointer is above its midpoint', () => {
    expect(
      getRecordBoardDropTargetIndex({
        pointerY: 240,
        cardsContainerTop: 100,
        cardOffsets: [0, 100, 200, 300],
      }),
    ).toEqual(1);
  });

  it('should drop after a card when the pointer is below its midpoint', () => {
    expect(
      getRecordBoardDropTargetIndex({
        pointerY: 260,
        cardsContainerTop: 100,
        cardOffsets: [0, 100, 200, 300],
      }),
    ).toEqual(2);
  });

  it('should resolve variable-height cards from their cumulative offsets', () => {
    expect(
      getRecordBoardDropTargetIndex({
        pointerY: 90,
        cardsContainerTop: 0,
        cardOffsets: [0, 50, 250, 300],
      }),
    ).toEqual(1);

    expect(
      getRecordBoardDropTargetIndex({
        pointerY: 200,
        cardsContainerTop: 0,
        cardOffsets: [0, 50, 250, 300],
      }),
    ).toEqual(2);
  });

  it('should drop at the start when the pointer is above all cards', () => {
    expect(
      getRecordBoardDropTargetIndex({
        pointerY: 0,
        cardsContainerTop: 100,
        cardOffsets: [0, 100, 200],
      }),
    ).toEqual(0);
  });

  it('should drop at the end when the pointer is below all cards', () => {
    expect(
      getRecordBoardDropTargetIndex({
        pointerY: 1000,
        cardsContainerTop: 100,
        cardOffsets: [0, 100, 200],
      }),
    ).toEqual(2);
  });

  it('should drop at index zero in an empty column', () => {
    expect(
      getRecordBoardDropTargetIndex({
        pointerY: 500,
        cardsContainerTop: 100,
        cardOffsets: [0],
      }),
    ).toEqual(0);
  });
});
