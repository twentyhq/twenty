import { resolveRecordBoardColumnDrop } from '@/object-record/record-board/record-board-column/dnd/utils/resolveRecordBoardColumnDrop';

const COLUMN_WIDTH = 200;

const buildScrollWrapperElement = ({
  left = 0,
  scrollLeft = 0,
}: {
  left?: number;
  scrollLeft?: number;
}) =>
  ({
    getBoundingClientRect: () => ({ left }),
    scrollLeft,
  }) as HTMLElement;

describe('resolveRecordBoardColumnDrop', () => {
  const columnWidths = [COLUMN_WIDTH, COLUMN_WIDTH, COLUMN_WIDTH];

  it('should target the first slot when the pointer is before the first column midpoint', () => {
    const resolvedDrop = resolveRecordBoardColumnDrop({
      pointerX: 50,
      sourceIndex: 2,
      scrollWrapperElement: buildScrollWrapperElement({}),
      columnWidths,
    });

    expect(resolvedDrop).toEqual({
      sourceIndex: 2,
      dropTargetIndex: 0,
      destinationIndex: 0,
    });
  });

  it('should target the slot after a column once the pointer passes its midpoint', () => {
    const resolvedDrop = resolveRecordBoardColumnDrop({
      pointerX: 250,
      sourceIndex: 0,
      scrollWrapperElement: buildScrollWrapperElement({}),
      columnWidths,
    });

    expect(resolvedDrop.dropTargetIndex).toBe(1);
  });

  it('should target the trailing slot when the pointer is past the last column', () => {
    const resolvedDrop = resolveRecordBoardColumnDrop({
      pointerX: 550,
      sourceIndex: 0,
      scrollWrapperElement: buildScrollWrapperElement({}),
      columnWidths,
    });

    expect(resolvedDrop).toEqual({
      sourceIndex: 0,
      dropTargetIndex: 3,
      destinationIndex: 2,
    });
  });

  it('should not shift the destination index when moving a column to the left', () => {
    const resolvedDrop = resolveRecordBoardColumnDrop({
      pointerX: 50,
      sourceIndex: 2,
      scrollWrapperElement: buildScrollWrapperElement({}),
      columnWidths,
    });

    expect(resolvedDrop.destinationIndex).toBe(0);
  });

  it('should account for the scroll offset of the scroll wrapper', () => {
    const resolvedDrop = resolveRecordBoardColumnDrop({
      pointerX: 50,
      sourceIndex: 0,
      scrollWrapperElement: buildScrollWrapperElement({ scrollLeft: 200 }),
      columnWidths,
    });

    expect(resolvedDrop.dropTargetIndex).toBe(1);
  });

  it('should account for the left offset of the scroll wrapper', () => {
    const resolvedDrop = resolveRecordBoardColumnDrop({
      pointerX: 150,
      sourceIndex: 2,
      scrollWrapperElement: buildScrollWrapperElement({ left: 100 }),
      columnWidths,
    });

    expect(resolvedDrop.dropTargetIndex).toBe(0);
  });
});
