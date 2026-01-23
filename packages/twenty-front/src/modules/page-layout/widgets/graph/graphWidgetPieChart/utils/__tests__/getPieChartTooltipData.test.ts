import { type PieChartDataItemWithColor } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartDataItem';
import { type PieChartEnrichedData } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartEnrichedData';
import { getPieChartTooltipData } from '@/page-layout/widgets/graph/graphWidgetPieChart/utils/getPieChartTooltipData';
import { type GraphColorScheme } from '@/page-layout/widgets/graph/types/GraphColorScheme';
import { type ComputedDatum } from '@nivo/pie';

describe('getPieChartTooltipData', () => {
  const mockColorScheme: GraphColorScheme = {
    name: 'blue',
    solid: '#solid',
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
      id: 'Product A',
      value: 500,
      percentage: 50,
      colorScheme: mockColorScheme,
    },
    {
      id: 'Product B',
      value: 300,
      percentage: 30,
      colorScheme: { ...mockColorScheme, solid: '#solidB' },
    },
    {
      id: 'Product C',
      value: 200,
      percentage: 20,
      colorScheme: { ...mockColorScheme, solid: '#solidC' },
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

  describe('tooltip item generation', () => {
    it('should return tooltip data when datum matches enriched data', () => {
      const datum = createMockDatum('Product A');

      const result = getPieChartTooltipData({
        datum,
        enrichedData: mockEnrichedData,
        formatOptions: defaultFormatOptions,
      });

      expect(result).not.toBeNull();
      expect(result?.tooltipItem).toBeDefined();
    });

    it('should include correct tooltip item properties', () => {
      const datum = createMockDatum('Product A');

      const result = getPieChartTooltipData({
        datum,
        enrichedData: mockEnrichedData,
        formatOptions: defaultFormatOptions,
      });

      expect(result?.tooltipItem.key).toBe('Product A');
      expect(result?.tooltipItem.label).toBe('Product A');
      expect(result?.tooltipItem.value).toBe(500);
      expect(result?.tooltipItem.dotColor).toBe('#solid');
    });

    it('should use the correct color for different items', () => {
      const datumB = createMockDatum('Product B');

      const result = getPieChartTooltipData({
        datum: datumB,
        enrichedData: mockEnrichedData,
        formatOptions: defaultFormatOptions,
      });

      expect(result?.tooltipItem.dotColor).toBe('#solidB');
    });
  });

  describe('formatted value', () => {
    it('should include formatted value in tooltip item', () => {
      const datum = createMockDatum('Product A');

      const result = getPieChartTooltipData({
        datum,
        enrichedData: mockEnrichedData,
        formatOptions: defaultFormatOptions,
      });

      expect(result?.tooltipItem.formattedValue).toBeDefined();
      expect(typeof result?.tooltipItem.formattedValue).toBe('string');
    });

    it('should format value based on displayType', () => {
      const datum = createMockDatum('Product A');

      const resultNumber = getPieChartTooltipData({
        datum,
        enrichedData: mockEnrichedData,
        formatOptions: { displayType: 'number' },
      });

      const resultPercentage = getPieChartTooltipData({
        datum,
        enrichedData: mockEnrichedData,
        formatOptions: { displayType: 'percentage' },
        displayType: 'percentage',
      });

      expect(resultNumber?.tooltipItem.formattedValue).not.toBe(
        resultPercentage?.tooltipItem.formattedValue,
      );
    });
  });

  describe('null returns', () => {
    it('should return null when datum does not match any enriched data', () => {
      const datum = createMockDatum('Unknown Product');

      const result = getPieChartTooltipData({
        datum,
        enrichedData: mockEnrichedData,
        formatOptions: defaultFormatOptions,
      });

      expect(result).toBeNull();
    });

    it('should return null when enrichedData is empty', () => {
      const datum = createMockDatum('Product A');

      const result = getPieChartTooltipData({
        datum,
        enrichedData: [],
        formatOptions: defaultFormatOptions,
      });

      expect(result).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle item with zero value', () => {
      const enrichedDataWithZero: PieChartEnrichedData[] = [
        {
          id: 'Zero Item',
          value: 0,
          percentage: 0,
          colorScheme: mockColorScheme,
        },
      ];

      const datum = createMockDatum('Zero Item');

      const result = getPieChartTooltipData({
        datum,
        enrichedData: enrichedDataWithZero,
        formatOptions: defaultFormatOptions,
      });

      expect(result?.tooltipItem.value).toBe(0);
    });

    it('should handle special characters in id', () => {
      const enrichedDataWithSpecialChars: PieChartEnrichedData[] = [
        {
          id: 'Item & Special <chars>',
          value: 100,
          percentage: 100,
          colorScheme: mockColorScheme,
        },
      ];

      const datum = createMockDatum('Item & Special <chars>');

      const result = getPieChartTooltipData({
        datum,
        enrichedData: enrichedDataWithSpecialChars,
        formatOptions: defaultFormatOptions,
      });

      expect(result?.tooltipItem.key).toBe('Item & Special <chars>');
      expect(result?.tooltipItem.label).toBe('Item & Special <chars>');
    });
  });
});
