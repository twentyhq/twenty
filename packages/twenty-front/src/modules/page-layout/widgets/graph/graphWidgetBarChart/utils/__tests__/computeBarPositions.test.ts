import { type BarChartEnrichedKey } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartEnrichedKey';
import { computeBarPositions } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeBarPositions';
import { BarChartLayout } from '~/generated/graphql';

describe('computeBarPositions', () => {
  const defaultMargins = { top: 20, right: 20, bottom: 40, left: 60 };

  const redColorScheme = {
    name: 'red',
    solid: 'redSolid',
    variations: [
      'red1',
      'red2',
      'red3',
      'red4',
      'red5',
      'red6',
      'red7',
      'red8',
      'red9',
      'red10',
      'red11',
      'red12',
    ] as [
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
    ],
  };

  const greenColorScheme = {
    name: 'green',
    solid: 'greenSolid',
    variations: [
      'green1',
      'green2',
      'green3',
      'green4',
      'green5',
      'green6',
      'green7',
      'green8',
      'green9',
      'green10',
      'green11',
      'green12',
    ] as [
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
    ],
  };

  const defaultEnrichedKeysMap = new Map<string, BarChartEnrichedKey>([
    ['value1', { key: 'value1', label: 'Value 1', colorScheme: redColorScheme }],
    ['value2', { key: 'value2', label: 'Value 2', colorScheme: greenColorScheme }],
  ]);

  describe('empty data handling', () => {
    it('should return empty array when data is empty', () => {
      const result = computeBarPositions({
        data: [],
        indexBy: 'category',
        keys: ['value1'],
        enrichedKeysMap: defaultEnrichedKeysMap,
        chartWidth: 500,
        chartHeight: 300,
        margins: defaultMargins,
        layout: BarChartLayout.VERTICAL,
        groupMode: 'grouped',
        valueDomain: { min: 0, max: 100 },
        fallbackColor: '#cccccc',
        innerPadding: 2,
      });

      expect(result).toEqual([]);
    });

    it('should return empty array when keys is empty', () => {
      const result = computeBarPositions({
        data: [{ category: 'A', value1: 10 }],
        indexBy: 'category',
        keys: [],
        enrichedKeysMap: defaultEnrichedKeysMap,
        chartWidth: 500,
        chartHeight: 300,
        margins: defaultMargins,
        layout: BarChartLayout.VERTICAL,
        groupMode: 'grouped',
        valueDomain: { min: 0, max: 100 },
        fallbackColor: '#cccccc',
        innerPadding: 2,
      });

      expect(result).toEqual([]);
    });

    it('should return empty array when inner dimensions are zero or negative', () => {
      const result = computeBarPositions({
        data: [{ category: 'A', value1: 10 }],
        indexBy: 'category',
        keys: ['value1'],
        enrichedKeysMap: defaultEnrichedKeysMap,
        chartWidth: 50,
        chartHeight: 50,
        margins: { top: 30, right: 30, bottom: 30, left: 30 },
        layout: BarChartLayout.VERTICAL,
        groupMode: 'grouped',
        valueDomain: { min: 0, max: 100 },
        fallbackColor: '#cccccc',
        innerPadding: 2,
      });

      expect(result).toEqual([]);
    });
  });

  describe('grouped mode - vertical layout', () => {
    it('should generate bars for single category with single key', () => {
      const result = computeBarPositions({
        data: [{ category: 'A', value1: 50 }],
        indexBy: 'category',
        keys: ['value1'],
        enrichedKeysMap: defaultEnrichedKeysMap,
        chartWidth: 500,
        chartHeight: 300,
        margins: defaultMargins,
        layout: BarChartLayout.VERTICAL,
        groupMode: 'grouped',
        valueDomain: { min: 0, max: 100 },
        fallbackColor: '#cccccc',
        innerPadding: 2,
      });

      expect(result).toHaveLength(1);
      expect(result[0].indexValue).toBe('A');
      expect(result[0].seriesId).toBe('value1');
      expect(result[0].value).toBe(50);
      expect(result[0].color).toBe('redSolid');
    });

    it('should generate bars for multiple categories with multiple keys', () => {
      const result = computeBarPositions({
        data: [
          { category: 'A', value1: 50, value2: 30 },
          { category: 'B', value1: 70, value2: 40 },
        ],
        indexBy: 'category',
        keys: ['value1', 'value2'],
        enrichedKeysMap: defaultEnrichedKeysMap,
        chartWidth: 500,
        chartHeight: 300,
        margins: defaultMargins,
        layout: BarChartLayout.VERTICAL,
        groupMode: 'grouped',
        valueDomain: { min: 0, max: 100 },
        fallbackColor: '#cccccc',
        innerPadding: 2,
      });

      expect(result).toHaveLength(4);
      expect(result.map((b) => b.indexValue)).toContain('A');
      expect(result.map((b) => b.indexValue)).toContain('B');
    });

    it('should skip zero values when includeZeroValues is false', () => {
      const result = computeBarPositions({
        data: [{ category: 'A', value1: 0, value2: 30 }],
        indexBy: 'category',
        keys: ['value1', 'value2'],
        enrichedKeysMap: defaultEnrichedKeysMap,
        chartWidth: 500,
        chartHeight: 300,
        margins: defaultMargins,
        layout: BarChartLayout.VERTICAL,
        groupMode: 'grouped',
        valueDomain: { min: 0, max: 100 },
        fallbackColor: '#cccccc',
        innerPadding: 2,
        includeZeroValues: false,
      });

      expect(result).toHaveLength(1);
      expect(result[0].seriesId).toBe('value2');
    });

    it('should include zero values when includeZeroValues is true', () => {
      const result = computeBarPositions({
        data: [{ category: 'A', value1: 0, value2: 30 }],
        indexBy: 'category',
        keys: ['value1', 'value2'],
        enrichedKeysMap: defaultEnrichedKeysMap,
        chartWidth: 500,
        chartHeight: 300,
        margins: defaultMargins,
        layout: BarChartLayout.VERTICAL,
        groupMode: 'grouped',
        valueDomain: { min: 0, max: 100 },
        fallbackColor: '#cccccc',
        innerPadding: 2,
        includeZeroValues: true,
      });

      expect(result).toHaveLength(2);
    });
  });

  describe('grouped mode - horizontal layout', () => {
    it('should generate bars with horizontal positioning', () => {
      const result = computeBarPositions({
        data: [{ category: 'A', value1: 50 }],
        indexBy: 'category',
        keys: ['value1'],
        enrichedKeysMap: defaultEnrichedKeysMap,
        chartWidth: 500,
        chartHeight: 300,
        margins: defaultMargins,
        layout: BarChartLayout.HORIZONTAL,
        groupMode: 'grouped',
        valueDomain: { min: 0, max: 100 },
        fallbackColor: '#cccccc',
        innerPadding: 2,
      });

      expect(result).toHaveLength(1);
      expect(result[0].width).toBeGreaterThan(0);
    });
  });

  describe('stacked mode - vertical layout', () => {
    it('should stack bars on top of each other', () => {
      const result = computeBarPositions({
        data: [{ category: 'A', value1: 50, value2: 30 }],
        indexBy: 'category',
        keys: ['value1', 'value2'],
        enrichedKeysMap: defaultEnrichedKeysMap,
        chartWidth: 500,
        chartHeight: 300,
        margins: defaultMargins,
        layout: BarChartLayout.VERTICAL,
        groupMode: 'stacked',
        valueDomain: { min: 0, max: 100 },
        fallbackColor: '#cccccc',
        innerPadding: 2,
      });

      expect(result).toHaveLength(2);
      const bar1 = result.find((b) => b.seriesId === 'value1');
      const bar2 = result.find((b) => b.seriesId === 'value2');
      expect(bar1).toBeDefined();
      expect(bar2).toBeDefined();
      expect(bar1!.y).toBeGreaterThan(bar2!.y);
    });
  });

  describe('stacked mode - horizontal layout', () => {
    it('should stack bars horizontally', () => {
      const result = computeBarPositions({
        data: [{ category: 'A', value1: 50, value2: 30 }],
        indexBy: 'category',
        keys: ['value1', 'value2'],
        enrichedKeysMap: defaultEnrichedKeysMap,
        chartWidth: 500,
        chartHeight: 300,
        margins: defaultMargins,
        layout: BarChartLayout.HORIZONTAL,
        groupMode: 'stacked',
        valueDomain: { min: 0, max: 100 },
        fallbackColor: '#cccccc',
        innerPadding: 2,
      });

      expect(result).toHaveLength(2);
      const bar1 = result.find((b) => b.seriesId === 'value1');
      const bar2 = result.find((b) => b.seriesId === 'value2');
      expect(bar1).toBeDefined();
      expect(bar2).toBeDefined();
      expect(bar2!.x).toBeGreaterThan(bar1!.x);
    });
  });

  describe('negative values', () => {
    it('should handle negative values in grouped mode', () => {
      const result = computeBarPositions({
        data: [{ category: 'A', value1: -30, value2: 50 }],
        indexBy: 'category',
        keys: ['value1', 'value2'],
        enrichedKeysMap: defaultEnrichedKeysMap,
        chartWidth: 500,
        chartHeight: 300,
        margins: defaultMargins,
        layout: BarChartLayout.VERTICAL,
        groupMode: 'grouped',
        valueDomain: { min: -50, max: 100 },
        fallbackColor: '#cccccc',
        innerPadding: 2,
      });

      expect(result).toHaveLength(2);
      const negativeBar = result.find((b) => b.seriesId === 'value1');
      expect(negativeBar).toBeDefined();
      expect(negativeBar!.value).toBe(-30);
    });

    it('should handle negative values in stacked mode', () => {
      const result = computeBarPositions({
        data: [{ category: 'A', value1: -30, value2: 50 }],
        indexBy: 'category',
        keys: ['value1', 'value2'],
        enrichedKeysMap: defaultEnrichedKeysMap,
        chartWidth: 500,
        chartHeight: 300,
        margins: defaultMargins,
        layout: BarChartLayout.VERTICAL,
        groupMode: 'stacked',
        valueDomain: { min: -50, max: 100 },
        fallbackColor: '#cccccc',
        innerPadding: 2,
      });

      expect(result).toHaveLength(2);
    });
  });

  describe('fallback color', () => {
    it('should use fallback color when key is not in enrichedKeysMap', () => {
      const result = computeBarPositions({
        data: [{ category: 'A', unknownKey: 50 }],
        indexBy: 'category',
        keys: ['unknownKey'],
        enrichedKeysMap: defaultEnrichedKeysMap,
        chartWidth: 500,
        chartHeight: 300,
        margins: defaultMargins,
        layout: BarChartLayout.VERTICAL,
        groupMode: 'grouped',
        valueDomain: { min: 0, max: 100 },
        fallbackColor: '#cccccc',
        innerPadding: 2,
      });

      expect(result).toHaveLength(1);
      expect(result[0].color).toBe('#cccccc');
    });
  });

  describe('bar properties', () => {
    it('should set correct seriesIndex for grouped bars', () => {
      const result = computeBarPositions({
        data: [{ category: 'A', value1: 50, value2: 30 }],
        indexBy: 'category',
        keys: ['value1', 'value2'],
        enrichedKeysMap: defaultEnrichedKeysMap,
        chartWidth: 500,
        chartHeight: 300,
        margins: defaultMargins,
        layout: BarChartLayout.VERTICAL,
        groupMode: 'grouped',
        valueDomain: { min: 0, max: 100 },
        fallbackColor: '#cccccc',
        innerPadding: 2,
      });

      const bar1 = result.find((b) => b.seriesId === 'value1');
      const bar2 = result.find((b) => b.seriesId === 'value2');
      expect(bar1!.seriesIndex).toBe(0);
      expect(bar2!.seriesIndex).toBe(1);
    });
  });
});
