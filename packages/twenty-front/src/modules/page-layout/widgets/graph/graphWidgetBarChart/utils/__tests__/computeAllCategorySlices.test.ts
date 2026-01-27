import { computeAllCategorySlices } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeAllCategorySlices';

describe('computeAllCategorySlices', () => {
  const defaultMargins = { top: 20, right: 20, bottom: 40, left: 60 };

  describe('empty data handling', () => {
    it('should return empty array when data is empty', () => {
      const result = computeAllCategorySlices({
        data: [],
        indexBy: 'category',
        bars: [],
        isVerticalLayout: true,
        chartWidth: 500,
        chartHeight: 300,
        margins: defaultMargins,
      });

      expect(result).toEqual([]);
    });
  });

  describe('vertical layout', () => {
    it('should create slices for each data point', () => {
      const data = [
        { category: 'A', value: 10 },
        { category: 'B', value: 20 },
        { category: 'C', value: 30 },
      ];

      const result = computeAllCategorySlices({
        data,
        indexBy: 'category',
        bars: [],
        isVerticalLayout: true,
        chartWidth: 500,
        chartHeight: 300,
        margins: defaultMargins,
      });

      expect(result).toHaveLength(3);
      expect(result.map((s) => s.indexValue)).toEqual(['A', 'B', 'C']);
    });

    it('should assign bars to correct slices', () => {
      const data = [
        { category: 'A', value: 10 },
        { category: 'B', value: 20 },
      ];
      const bars = [
        {
          x: 50,
          y: 100,
          width: 40,
          height: 60,
          value: 10,
          indexValue: 'A',
          seriesId: 'value',
          color: 'red',
          shouldRoundFreeEnd: true,
          seriesIndex: 0,
        },
        {
          x: 150,
          y: 80,
          width: 40,
          height: 80,
          value: 20,
          indexValue: 'B',
          seriesId: 'value',
          color: 'red',
          shouldRoundFreeEnd: true,
          seriesIndex: 0,
        },
      ];

      const result = computeAllCategorySlices({
        data,
        indexBy: 'category',
        bars,
        isVerticalLayout: true,
        chartWidth: 500,
        chartHeight: 300,
        margins: defaultMargins,
      });

      expect(result[0].bars).toHaveLength(1);
      expect(result[0].bars[0].indexValue).toBe('A');
      expect(result[1].bars).toHaveLength(1);
      expect(result[1].bars[0].indexValue).toBe('B');
    });

    it('should calculate slice boundaries correctly', () => {
      const data = [{ category: 'A', value: 10 }];

      const result = computeAllCategorySlices({
        data,
        indexBy: 'category',
        bars: [],
        isVerticalLayout: true,
        chartWidth: 500,
        chartHeight: 300,
        margins: defaultMargins,
      });

      expect(result[0].sliceLeft).toBeDefined();
      expect(result[0].sliceRight).toBeDefined();
      expect(result[0].sliceCenter).toBeDefined();
      expect(result[0].sliceLeft).toBeLessThan(result[0].sliceCenter);
      expect(result[0].sliceCenter).toBeLessThan(result[0].sliceRight);
    });
  });

  describe('horizontal layout', () => {
    it('should assign bars to correct slices in horizontal layout', () => {
      const data = [
        { category: 'A', value: 10 },
        { category: 'B', value: 20 },
      ];
      const bars = [
        {
          x: 0,
          y: 100,
          width: 60,
          height: 40,
          value: 10,
          indexValue: 'A',
          seriesId: 'value',
          color: 'red',
          shouldRoundFreeEnd: true,
          seriesIndex: 0,
        },
        {
          x: 0,
          y: 50,
          width: 80,
          height: 40,
          value: 20,
          indexValue: 'B',
          seriesId: 'value',
          color: 'red',
          shouldRoundFreeEnd: true,
          seriesIndex: 0,
        },
      ];

      const result = computeAllCategorySlices({
        data,
        indexBy: 'category',
        bars,
        isVerticalLayout: false,
        chartWidth: 500,
        chartHeight: 300,
        margins: defaultMargins,
      });

      expect(result[0].bars).toHaveLength(1);
      expect(result[0].bars[0].indexValue).toBe('A');
      expect(result[1].bars).toHaveLength(1);
      expect(result[1].bars[0].indexValue).toBe('B');
      expect(result[0].sliceLeft).toBeGreaterThan(result[1].sliceLeft);
    });
  });

  describe('multiple bars per category', () => {
    it('should group multiple bars under the same slice', () => {
      const data = [{ category: 'A', value1: 10, value2: 20 }];
      const bars = [
        {
          x: 50,
          y: 100,
          width: 20,
          height: 60,
          value: 10,
          indexValue: 'A',
          seriesId: 'value1',
          color: 'red',
          shouldRoundFreeEnd: true,
          seriesIndex: 0,
        },
        {
          x: 75,
          y: 80,
          width: 20,
          height: 80,
          value: 20,
          indexValue: 'A',
          seriesId: 'value2',
          color: 'green',
          shouldRoundFreeEnd: true,
          seriesIndex: 1,
        },
      ];

      const result = computeAllCategorySlices({
        data,
        indexBy: 'category',
        bars,
        isVerticalLayout: true,
        chartWidth: 500,
        chartHeight: 300,
        margins: defaultMargins,
      });

      expect(result).toHaveLength(1);
      expect(result[0].bars).toHaveLength(2);
    });
  });

  describe('categories without bars', () => {
    it('should create slices even when no bars exist for a category', () => {
      const data = [
        { category: 'A', value: 10 },
        { category: 'B', value: 0 },
      ];
      const bars = [
        {
          x: 50,
          y: 100,
          width: 40,
          height: 60,
          value: 10,
          indexValue: 'A',
          seriesId: 'value',
          color: 'red',
          shouldRoundFreeEnd: true,
          seriesIndex: 0,
        },
      ];

      const result = computeAllCategorySlices({
        data,
        indexBy: 'category',
        bars,
        isVerticalLayout: true,
        chartWidth: 500,
        chartHeight: 300,
        margins: defaultMargins,
      });

      expect(result).toHaveLength(2);
      expect(result[0].bars).toHaveLength(1);
      expect(result[1].bars).toHaveLength(0);
      expect(result[1].indexValue).toBe('B');
    });
  });

  describe('index value conversion', () => {
    it('should convert numeric index values to strings', () => {
      const data = [{ id: 1, value: 10 }];

      const result = computeAllCategorySlices({
        data,
        indexBy: 'id',
        bars: [],
        isVerticalLayout: true,
        chartWidth: 500,
        chartHeight: 300,
        margins: defaultMargins,
      });

      expect(result[0].indexValue).toBe('1');
    });
  });
});
