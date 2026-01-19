import { type PieChartDataItemWithColor } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartDataItem';
import { type PieChartEnrichedData } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartEnrichedData';
import { getPieChartFormattedValue } from '@/page-layout/widgets/graph/graphWidgetPieChart/utils/getPieChartFormattedValue';
import { type GraphColorScheme } from '@/page-layout/widgets/graph/types/GraphColorScheme';
import { type ComputedDatum } from '@nivo/pie';

describe('getPieChartFormattedValue', () => {
  const mockColorScheme: GraphColorScheme = {
    name: 'blue',
    solid: '#solidBlue',
    variations: [
      '#v0',
      '#v1',
      '#v2',
      '#v3',
      '#v4',
      '#v5',
      '#v6',
      '#v7',
      '#v8',
      '#v9',
      '#v10',
      '#v11',
    ],
  };

  const mockEnrichedData: PieChartEnrichedData[] = [
    {
      id: 'slice1',
      value: 30,
      percentage: 30,
      colorScheme: mockColorScheme,
    },
    {
      id: 'slice2',
      value: 50,
      percentage: 50,
      colorScheme: mockColorScheme,
    },
    {
      id: 'slice3',
      value: 20,
      percentage: 20,
      colorScheme: mockColorScheme,
    },
  ];

  const createMockDatum = (
    id: string,
  ): ComputedDatum<PieChartDataItemWithColor> =>
    ({
      id,
      value: 0,
    }) as unknown as ComputedDatum<PieChartDataItemWithColor>;

  const defaultFormatOptions = {
    displayType: 'number' as const,
  };

  describe('matching datum to enriched data', () => {
    it('should return formatted value when datum matches enriched data', () => {
      const datum = createMockDatum('slice1');

      const result = getPieChartFormattedValue({
        datum,
        enrichedData: mockEnrichedData,
        formatOptions: defaultFormatOptions,
      });

      expect(result).not.toBeNull();
    });

    it('should return null when datum does not match any enriched data', () => {
      const datum = createMockDatum('nonexistent');

      const result = getPieChartFormattedValue({
        datum,
        enrichedData: mockEnrichedData,
        formatOptions: defaultFormatOptions,
      });

      expect(result).toBeNull();
    });
  });

  describe('percentage display type', () => {
    it('should format as percentage when displayType is percentage', () => {
      const datum = createMockDatum('slice1');

      const result = getPieChartFormattedValue({
        datum,
        enrichedData: mockEnrichedData,
        formatOptions: { displayType: 'percentage' },
        displayType: 'percentage',
      });

      expect(result).toContain('%');
    });

    it('should use the item percentage for percentage display', () => {
      const datum = createMockDatum('slice2');

      const result = getPieChartFormattedValue({
        datum,
        enrichedData: mockEnrichedData,
        formatOptions: { displayType: 'percentage' },
        displayType: 'percentage',
      });

      expect(result).toBeDefined();
      expect(result).toContain('%');
    });
  });

  describe('number display type', () => {
    it('should include both value and percentage when not percentage display', () => {
      const datum = createMockDatum('slice1');

      const result = getPieChartFormattedValue({
        datum,
        enrichedData: mockEnrichedData,
        formatOptions: defaultFormatOptions,
      });

      expect(result).toContain('30');
      expect(result).toContain('%');
    });

    it('should format percentage to one decimal place', () => {
      const enrichedDataWithDecimal: PieChartEnrichedData[] = [
        {
          id: 'slice1',
          value: 33,
          percentage: 33.333,
          colorScheme: mockColorScheme,
        },
      ];

      const datum = createMockDatum('slice1');

      const result = getPieChartFormattedValue({
        datum,
        enrichedData: enrichedDataWithDecimal,
        formatOptions: defaultFormatOptions,
      });

      expect(result).toContain('33.3%');
    });
  });

  describe('edge cases', () => {
    it('should handle zero value', () => {
      const enrichedDataWithZero: PieChartEnrichedData[] = [
        {
          id: 'zero',
          value: 0,
          percentage: 0,
          colorScheme: mockColorScheme,
        },
      ];

      const datum = createMockDatum('zero');

      const result = getPieChartFormattedValue({
        datum,
        enrichedData: enrichedDataWithZero,
        formatOptions: defaultFormatOptions,
      });

      expect(result).toContain('0');
    });

    it('should handle 100% value', () => {
      const enrichedDataWith100: PieChartEnrichedData[] = [
        {
          id: 'full',
          value: 100,
          percentage: 100,
          colorScheme: mockColorScheme,
        },
      ];

      const datum = createMockDatum('full');

      const result = getPieChartFormattedValue({
        datum,
        enrichedData: enrichedDataWith100,
        formatOptions: defaultFormatOptions,
      });

      expect(result).toContain('100');
    });

    it('should return null when enrichedData is empty', () => {
      const datum = createMockDatum('slice1');

      const result = getPieChartFormattedValue({
        datum,
        enrichedData: [],
        formatOptions: defaultFormatOptions,
      });

      expect(result).toBeNull();
    });
  });
});
