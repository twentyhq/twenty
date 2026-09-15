import { getDestinationIndex } from '@/ui/utilities/drag-and-drop/utils/getDestinationIndex';

describe('getDestinationIndex', () => {
  it('should return the drop target index unchanged across columns', () => {
    const result = getDestinationIndex({
      dropTargetIndex: 2,
      sourceIndex: 5,
      sourceDroppableId: 'column-a',
      destinationDroppableId: 'column-b',
    });

    expect(result).toBe(2);
  });

  it('should decrement the index when moving down within the same column', () => {
    const result = getDestinationIndex({
      dropTargetIndex: 4,
      sourceIndex: 1,
      sourceDroppableId: 'column-a',
      destinationDroppableId: 'column-a',
    });

    expect(result).toBe(3);
  });

  it('should keep the index when moving up within the same column', () => {
    const result = getDestinationIndex({
      dropTargetIndex: 1,
      sourceIndex: 4,
      sourceDroppableId: 'column-a',
      destinationDroppableId: 'column-a',
    });

    expect(result).toBe(1);
  });

  it('should keep the index when dropping onto the source position', () => {
    const result = getDestinationIndex({
      dropTargetIndex: 3,
      sourceIndex: 3,
      sourceDroppableId: 'column-a',
      destinationDroppableId: 'column-a',
    });

    expect(result).toBe(3);
  });
});
