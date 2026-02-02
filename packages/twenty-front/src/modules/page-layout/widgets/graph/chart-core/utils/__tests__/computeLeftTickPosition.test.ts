import { computeLeftTickPosition } from '@/page-layout/widgets/graph/chart-core/utils/computeLeftTickPosition';

describe('computeLeftTickPosition', () => {
  const defaultCategoryScale = {
    offset: 20,
    step: 100,
    bandwidth: 80,
  };

  describe('vertical layout (value axis on left)', () => {
    it('should position minimum value at bottom (innerHeight)', () => {
      const result = computeLeftTickPosition({
        value: 0,
        index: 0,
        isVertical: true,
        categoryValues: ['A', 'B'],
        categoryIndexMap: new Map(),
        categoryScale: defaultCategoryScale,
        valueDomain: { min: 0, max: 100 },
        innerHeight: 200,
      });

      expect(result).toBe(200);
    });

    it('should position maximum value at top (0)', () => {
      const result = computeLeftTickPosition({
        value: 100,
        index: 0,
        isVertical: true,
        categoryValues: ['A', 'B'],
        categoryIndexMap: new Map(),
        categoryScale: defaultCategoryScale,
        valueDomain: { min: 0, max: 100 },
        innerHeight: 200,
      });

      expect(result).toBe(0);
    });

    it('should return innerHeight when range is 0', () => {
      const result = computeLeftTickPosition({
        value: 50,
        index: 0,
        isVertical: true,
        categoryValues: ['A', 'B'],
        categoryIndexMap: new Map(),
        categoryScale: defaultCategoryScale,
        valueDomain: { min: 50, max: 50 },
        innerHeight: 200,
      });

      expect(result).toBe(200);
    });

    it('should handle negative values', () => {
      const result = computeLeftTickPosition({
        value: 0,
        index: 0,
        isVertical: true,
        categoryValues: ['A', 'B'],
        categoryIndexMap: new Map(),
        categoryScale: defaultCategoryScale,
        valueDomain: { min: -50, max: 50 },
        innerHeight: 200,
      });

      expect(result).toBe(100);
    });
  });

  describe('horizontal layout (category axis on left)', () => {
    it('should return center of category band (reversed order)', () => {
      const categoryIndexMap = new Map([
        ['A', 0],
        ['B', 1],
      ]);

      const result = computeLeftTickPosition({
        value: 'A',
        index: 0,
        isVertical: false,
        categoryValues: ['A', 'B'],
        categoryIndexMap,
        categoryScale: defaultCategoryScale,
        valueDomain: { min: 0, max: 100 },
        innerHeight: 200,
      });

      const effectiveIndex = 2 - 1 - 0;
      const expectedCenter = 20 + effectiveIndex * 100 + 80 / 2;
      expect(result).toBe(expectedCenter);
    });

    it('should return 0 when categoryValues is empty', () => {
      const result = computeLeftTickPosition({
        value: 'A',
        index: 0,
        isVertical: false,
        categoryValues: [],
        categoryIndexMap: new Map(),
        categoryScale: defaultCategoryScale,
        valueDomain: { min: 0, max: 100 },
        innerHeight: 200,
      });

      expect(result).toBe(0);
    });

    it('should clamp index when value not found in map', () => {
      const categoryIndexMap = new Map([['A', 0]]);

      const result = computeLeftTickPosition({
        value: 'X',
        index: 5,
        isVertical: false,
        categoryValues: ['A'],
        categoryIndexMap,
        categoryScale: defaultCategoryScale,
        valueDomain: { min: 0, max: 100 },
        innerHeight: 200,
      });

      const effectiveIndex = 1 - 1 - 0;
      const expectedCenter = 20 + effectiveIndex * 100 + 80 / 2;
      expect(result).toBe(expectedCenter);
    });
  });
});
