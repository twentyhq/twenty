import { calculateNewPosition } from '@/ui/layout/draggable-list/utils/calculateNewPosition';

describe('calculateNewPosition', () => {
  const createItems = (positions: number[]) =>
    positions.map((position) => ({ position }));

  describe('when destinationIndex is 0', () => {
    it('should return position before first item', () => {
      const items = createItems([10, 20, 30]);

      const result = calculateNewPosition({
        destinationIndex: 0,
        sourceIndex: 1,
        items,
      });

      expect(result).toBe(9);
    });

    it('should work with single item', () => {
      const items = createItems([5]);

      const result = calculateNewPosition({
        destinationIndex: 0,
        sourceIndex: 0,
        items,
      });

      expect(result).toBe(4);
    });
  });

  describe('when destinationIndex equals items.length', () => {
    it('should return position after last item', () => {
      const items = createItems([10, 20, 30]);

      const result = calculateNewPosition({
        destinationIndex: 3,
        sourceIndex: 0,
        items,
      });

      expect(result).toBe(31);
    });

    it('should work with single item', () => {
      const items = createItems([5]);

      const result = calculateNewPosition({
        destinationIndex: 1,
        sourceIndex: 0,
        items,
      });

      expect(result).toBe(6);
    });
  });

  describe('when moving down (destinationIndex > sourceIndex)', () => {
    it('should return midpoint between destination and previous item', () => {
      const items = createItems([10, 20, 30]);

      const result = calculateNewPosition({
        destinationIndex: 2,
        sourceIndex: 0,
        items,
      });

      expect(result).toBe(25);
    });

    it('should return fractional midpoints for adjacent positions', () => {
      const items = createItems([1, 2, 5]);

      const result = calculateNewPosition({
        destinationIndex: 2,
        sourceIndex: 0,
        items,
      });

      expect(result).toBe(3.5);
    });
  });

  describe('when moving up (destinationIndex <= sourceIndex and not at edges)', () => {
    it('should return midpoint between destination and previous item', () => {
      const items = createItems([10, 20, 30]);

      const result = calculateNewPosition({
        destinationIndex: 1,
        sourceIndex: 2,
        items,
      });

      expect(result).toBe(15);
    });

    it('should return fractional midpoints for adjacent positions', () => {
      const items = createItems([1, 4, 10]);

      const result = calculateNewPosition({
        destinationIndex: 1,
        sourceIndex: 2,
        items,
      });

      expect(result).toBe(2.5);
    });

    it('should produce unique position for sequential integers', () => {
      const items = createItems([1, 2]);

      const result = calculateNewPosition({
        destinationIndex: 1,
        sourceIndex: 2,
        items,
      });

      expect(result).toBe(1.5);
      expect(result).not.toBe(items[0].position);
      expect(result).not.toBe(items[1].position);
    });

    it('should handle destinationIndex equal to sourceIndex', () => {
      const items = createItems([10, 20, 30]);

      const result = calculateNewPosition({
        destinationIndex: 1,
        sourceIndex: 1,
        items,
      });

      expect(result).toBe(15);
    });
  });
});
