import { computeBottomTickPosition } from '@/page-layout/widgets/graph/chart-core/utils/computeBottomTickPosition';

describe('computeBottomTickPosition', () => {
  const defaultCategoryScale = {
    offset: 20,
    step: 100,
    bandwidth: 80,
  };

  describe('vertical layout (category axis on bottom)', () => {
    it('should return center of category band', () => {
      const categoryIndexMap = new Map([
        ['A', 0],
        ['B', 1],
      ]);

      const result = computeBottomTickPosition({
        value: 'A',
        index: 0,
        isVertical: true,
        categoryValues: ['A', 'B'],
        categoryIndexMap,
        categoryScale: defaultCategoryScale,
        valueDomain: { min: 0, max: 100 },
        innerWidth: 400,
      });

      const expectedCenter = 20 + 0 * 100 + 80 / 2;
      expect(result).toBe(expectedCenter);
    });

    it('should return 0 when categoryValues is empty', () => {
      const result = computeBottomTickPosition({
        value: 'A',
        index: 0,
        isVertical: true,
        categoryValues: [],
        categoryIndexMap: new Map(),
        categoryScale: defaultCategoryScale,
        valueDomain: { min: 0, max: 100 },
        innerWidth: 400,
      });

      expect(result).toBe(0);
    });

    it('should clamp index when value not found in map', () => {
      const categoryIndexMap = new Map([['A', 0]]);

      const result = computeBottomTickPosition({
        value: 'X',
        index: 5,
        isVertical: true,
        categoryValues: ['A'],
        categoryIndexMap,
        categoryScale: defaultCategoryScale,
        valueDomain: { min: 0, max: 100 },
        innerWidth: 400,
      });

      const expectedCenter = 20 + 0 * 100 + 80 / 2;
      expect(result).toBe(expectedCenter);
    });
  });

  describe('horizontal layout (value axis on bottom)', () => {
    it('should position minimum value at 0', () => {
      const result = computeBottomTickPosition({
        value: 0,
        index: 0,
        isVertical: false,
        categoryValues: ['A', 'B'],
        categoryIndexMap: new Map(),
        categoryScale: defaultCategoryScale,
        valueDomain: { min: 0, max: 100 },
        innerWidth: 400,
      });

      expect(result).toBe(0);
    });

    it('should position maximum value at innerWidth', () => {
      const result = computeBottomTickPosition({
        value: 100,
        index: 0,
        isVertical: false,
        categoryValues: ['A', 'B'],
        categoryIndexMap: new Map(),
        categoryScale: defaultCategoryScale,
        valueDomain: { min: 0, max: 100 },
        innerWidth: 400,
      });

      expect(result).toBe(400);
    });

    it('should return 0 when range is 0', () => {
      const result = computeBottomTickPosition({
        value: 50,
        index: 0,
        isVertical: false,
        categoryValues: ['A', 'B'],
        categoryIndexMap: new Map(),
        categoryScale: defaultCategoryScale,
        valueDomain: { min: 50, max: 50 },
        innerWidth: 400,
      });

      expect(result).toBe(0);
    });

    it('should handle negative values', () => {
      const result = computeBottomTickPosition({
        value: 0,
        index: 0,
        isVertical: false,
        categoryValues: ['A', 'B'],
        categoryIndexMap: new Map(),
        categoryScale: defaultCategoryScale,
        valueDomain: { min: -50, max: 50 },
        innerWidth: 400,
      });

      expect(result).toBe(200);
    });
  });
});
