import { calculateNewPosition } from '@/ui/layout/draggable-list/utils/calculateNewPosition';

describe('calculateNewPosition', () => {
  const createItems = (positions: number[]) =>
    positions.map((position) => ({ position }));

  describe('when destinationIndex is 0', () => {
    it('should return position before first item', () => {
      const items = createItems([10, 20, 30]);

      const result = calculateNewPosition({
        destinationIndex: 0,
        items,
      });

      expect(result).toBe(9);
    });

    it('should work with single item', () => {
      const items = createItems([5]);

      const result = calculateNewPosition({
        destinationIndex: 0,
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
        items,
      });

      expect(result).toBe(31);
    });

    it('should work with single item', () => {
      const items = createItems([5]);

      const result = calculateNewPosition({
        destinationIndex: 1,
        items,
      });

      expect(result).toBe(6);
    });
  });

  describe('when inserting between two items', () => {
    it('should return midpoint between destination and previous item', () => {
      const items = createItems([10, 20, 30]);

      expect(calculateNewPosition({ destinationIndex: 1, items })).toBe(15);
      expect(calculateNewPosition({ destinationIndex: 2, items })).toBe(25);
    });

    it('should return fractional midpoints for adjacent positions', () => {
      expect(
        calculateNewPosition({
          destinationIndex: 2,
          items: createItems([1, 2, 5]),
        }),
      ).toBe(3.5);
      expect(
        calculateNewPosition({
          destinationIndex: 1,
          items: createItems([1, 4, 10]),
        }),
      ).toBe(2.5);
    });

    it('should produce unique position for sequential integers', () => {
      const items = createItems([1, 2]);

      const result = calculateNewPosition({
        destinationIndex: 1,
        items,
      });

      expect(result).toBe(1.5);
      expect(result).not.toBe(items[0].position);
      expect(result).not.toBe(items[1].position);
    });

    it('should not introduce floating point artifacts', () => {
      const items = createItems([0.1, 0.2]);

      expect(calculateNewPosition({ destinationIndex: 1, items })).toBe(0.15);
    });
  });
});
