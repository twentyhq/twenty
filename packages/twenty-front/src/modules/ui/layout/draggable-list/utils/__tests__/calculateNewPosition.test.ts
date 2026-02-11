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

      expect(result).toBe(Math.round(30 + (20 - 30) / 2));
      expect(result).toBe(25);
    });

    it('should round fractional midpoints', () => {
      const items = createItems([1, 2, 5]);

      const result = calculateNewPosition({
        destinationIndex: 2,
        sourceIndex: 0,
        items,
      });

      expect(result).toBe(Math.round(5 + (2 - 5) / 2));
      expect(result).toBe(4);
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

      expect(result).toBe(Math.round(20 - (20 - 10) / 2));
      expect(result).toBe(15);
    });

    it('should round fractional midpoints', () => {
      const items = createItems([1, 4, 10]);

      const result = calculateNewPosition({
        destinationIndex: 1,
        sourceIndex: 2,
        items,
      });

      expect(result).toBe(Math.round(4 - (4 - 1) / 2));
      expect(result).toBe(3);
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
