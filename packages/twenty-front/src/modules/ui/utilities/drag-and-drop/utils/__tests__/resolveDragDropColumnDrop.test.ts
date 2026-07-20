import { resolveDragDropColumnDrop } from '@/ui/utilities/drag-and-drop/utils/resolveDragDropColumnDrop';

const createScrollWrapperElement = ({
  left = 0,
  scrollLeft = 0,
}: {
  left?: number;
  scrollLeft?: number;
}) =>
  ({
    getBoundingClientRect: () => ({ left }) as DOMRect,
    scrollLeft,
  }) as unknown as HTMLElement;

const COLUMN_WIDTHS = [100, 100, 100];

describe('resolveDragDropColumnDrop', () => {
  it('should target the column under the pointer before its midpoint', () => {
    const result = resolveDragDropColumnDrop({
      pointerX: 40,
      sourceIndex: 2,
      scrollWrapperElement: createScrollWrapperElement({}),
      columnWidths: COLUMN_WIDTHS,
    });

    expect(result).toEqual({
      sourceIndex: 2,
      dropTargetIndex: 0,
      destinationIndex: 0,
    });
  });

  it('should target the next slot once the pointer passes a column midpoint', () => {
    const result = resolveDragDropColumnDrop({
      pointerX: 120,
      sourceIndex: 2,
      scrollWrapperElement: createScrollWrapperElement({}),
      columnWidths: COLUMN_WIDTHS,
    });

    expect(result.dropTargetIndex).toBe(1);
    expect(result.destinationIndex).toBe(1);
  });

  it('should target the trailing slot when the pointer is past every column', () => {
    const result = resolveDragDropColumnDrop({
      pointerX: 400,
      sourceIndex: 0,
      scrollWrapperElement: createScrollWrapperElement({}),
      columnWidths: COLUMN_WIDTHS,
    });

    expect(result.dropTargetIndex).toBe(COLUMN_WIDTHS.length);
    expect(result.destinationIndex).toBe(COLUMN_WIDTHS.length - 1);
  });

  it('should decrement destinationIndex when dropping to the right of the source', () => {
    const result = resolveDragDropColumnDrop({
      pointerX: 160,
      sourceIndex: 0,
      scrollWrapperElement: createScrollWrapperElement({}),
      columnWidths: COLUMN_WIDTHS,
    });

    expect(result.dropTargetIndex).toBe(2);
    expect(result.destinationIndex).toBe(1);
  });

  it('should keep destinationIndex equal to dropTargetIndex when dropping to the left of the source', () => {
    const result = resolveDragDropColumnDrop({
      pointerX: 120,
      sourceIndex: 2,
      scrollWrapperElement: createScrollWrapperElement({}),
      columnWidths: COLUMN_WIDTHS,
    });

    expect(result.dropTargetIndex).toBe(1);
    expect(result.destinationIndex).toBe(1);
  });

  it('should offset the pointer by the scroll position', () => {
    const result = resolveDragDropColumnDrop({
      pointerX: 40,
      sourceIndex: 2,
      scrollWrapperElement: createScrollWrapperElement({ scrollLeft: 100 }),
      columnWidths: COLUMN_WIDTHS,
    });

    expect(result.dropTargetIndex).toBe(1);
  });

  it('should offset the pointer by the container left', () => {
    const result = resolveDragDropColumnDrop({
      pointerX: 90,
      sourceIndex: 2,
      scrollWrapperElement: createScrollWrapperElement({ left: 50 }),
      columnWidths: COLUMN_WIDTHS,
    });

    expect(result.dropTargetIndex).toBe(0);
  });

  it('should subtract the leading offset before resolving the column', () => {
    const result = resolveDragDropColumnDrop({
      pointerX: 140,
      sourceIndex: 2,
      scrollWrapperElement: createScrollWrapperElement({}),
      columnWidths: COLUMN_WIDTHS,
      leadingOffset: 100,
    });

    expect(result.dropTargetIndex).toBe(0);
  });
});
