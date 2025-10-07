import { adjustDestinationIndexForDrag } from '../adjustDestinationIndexForDrag';

describe('adjustDestinationIndexForDrag', () => {
  describe('dragging within the same droppable', () => {
    it('should return the same index when dragging within the same droppable', () => {
      const result = adjustDestinationIndexForDrag({
        sourceDroppableId: 'droppable-1',
        destinationDroppableId: 'droppable-1',
        sourceIndex: 2,
        destinationIndex: 5,
      });

      expect(result).toBe(5);
    });

    it('should return the same index when dragging backwards within the same droppable', () => {
      const result = adjustDestinationIndexForDrag({
        sourceDroppableId: 'droppable-1',
        destinationDroppableId: 'droppable-1',
        sourceIndex: 5,
        destinationIndex: 2,
      });

      expect(result).toBe(2);
    });

    it('should handle dragging to the same position', () => {
      const result = adjustDestinationIndexForDrag({
        sourceDroppableId: 'droppable-1',
        destinationDroppableId: 'droppable-1',
        sourceIndex: 3,
        destinationIndex: 3,
      });

      expect(result).toBe(3);
    });
  });

  describe('dragging between different droppables', () => {
    it('should subtract 1 when moving between droppables and destination > source', () => {
      const result = adjustDestinationIndexForDrag({
        sourceDroppableId: 'droppable-1',
        destinationDroppableId: 'droppable-2',
        sourceIndex: 2,
        destinationIndex: 5,
      });

      expect(result).toBe(4);
    });

    it('should not adjust when moving between droppables and destination <= source', () => {
      const result = adjustDestinationIndexForDrag({
        sourceDroppableId: 'droppable-1',
        destinationDroppableId: 'droppable-2',
        sourceIndex: 5,
        destinationIndex: 2,
      });

      expect(result).toBe(2);
    });

    it('should not adjust when moving between droppables and destination equals source', () => {
      const result = adjustDestinationIndexForDrag({
        sourceDroppableId: 'droppable-1',
        destinationDroppableId: 'droppable-2',
        sourceIndex: 3,
        destinationIndex: 3,
      });

      expect(result).toBe(3);
    });

    it('should handle moving from droppable-1 to droppable-2 at index 0', () => {
      const result = adjustDestinationIndexForDrag({
        sourceDroppableId: 'droppable-1',
        destinationDroppableId: 'droppable-2',
        sourceIndex: 2,
        destinationIndex: 0,
      });

      expect(result).toBe(0);
    });

    it('should subtract 1 when moving to a much higher index between droppables', () => {
      const result = adjustDestinationIndexForDrag({
        sourceDroppableId: 'visible-tabs',
        destinationDroppableId: 'overflow-dropdown',
        sourceIndex: 1,
        destinationIndex: 10,
      });

      expect(result).toBe(9);
    });
  });

  describe('edge cases', () => {
    it('should handle index 0 in both source and destination', () => {
      const result = adjustDestinationIndexForDrag({
        sourceDroppableId: 'droppable-1',
        destinationDroppableId: 'droppable-1',
        sourceIndex: 0,
        destinationIndex: 0,
      });

      expect(result).toBe(0);
    });

    it('should handle moving from index 0 to a higher index between droppables', () => {
      const result = adjustDestinationIndexForDrag({
        sourceDroppableId: 'droppable-1',
        destinationDroppableId: 'droppable-2',
        sourceIndex: 0,
        destinationIndex: 3,
      });

      expect(result).toBe(2);
    });
  });
});
