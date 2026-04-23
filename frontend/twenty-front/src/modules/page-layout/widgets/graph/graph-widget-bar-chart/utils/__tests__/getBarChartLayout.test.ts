import { TEXT_MARGIN_LIMITS } from '@/page-layout/widgets/graph/constants/TextMarginLimits';
import { getBarChartLayout } from '@/page-layout/widgets/graph/graph-widget-bar-chart/utils/getBarChartLayout';
import { type ChartAxisTheme } from '@/page-layout/widgets/graph/types/ChartAxisTheme';
import { type GraphValueFormatOptions } from '@/page-layout/widgets/graph/utils/graphFormatters';
import { type BarChartDatum } from '@/page-layout/widgets/graph/graph-widget-bar-chart/types/BarChartDatum';
import { BarChartLayout } from '~/generated-metadata/graphql';

describe('getBarChartLayout', () => {
  const defaultAxisTheme: ChartAxisTheme = {
    ticks: { text: { fontSize: 11 } },
    legend: { text: { fontSize: 11 } },
  };

  const defaultFormatOptions: GraphValueFormatOptions = {
    displayType: 'number',
  };

  const defaultData: BarChartDatum[] = [
    { category: 'A', value: 10 },
    { category: 'B', value: 20 },
    { category: 'C', value: 30 },
  ];

  const baseParams = {
    axisTheme: defaultAxisTheme,
    chartWidth: 500,
    chartHeight: 300,
    data: defaultData,
    indexBy: 'category',
    xAxisLabel: 'Categories',
    yAxisLabel: 'Values',
    formatOptions: defaultFormatOptions,
    effectiveMinimumValue: 0,
    effectiveMaximumValue: 30,
  };

  describe('vertical layout', () => {
    it('produces correct axis configurations', () => {
      const result = getBarChartLayout({
        ...baseParams,
        layout: BarChartLayout.VERTICAL,
      });

      expect(result.axisBottomConfiguration).toBeDefined();
      expect(result.axisLeftConfiguration).toBeDefined();
      expect(result.valueTickValues).toBeDefined();
      expect(result.valueDomain).toBeDefined();
    });

    it('returns margins within TEXT_MARGIN_LIMITS bounds', () => {
      const result = getBarChartLayout({
        ...baseParams,
        layout: BarChartLayout.VERTICAL,
      });

      expect(result.margins.top).toBeGreaterThanOrEqual(
        TEXT_MARGIN_LIMITS.min.top,
      );
      expect(result.margins.top).toBeLessThanOrEqual(
        TEXT_MARGIN_LIMITS.max.top,
      );
      expect(result.margins.right).toBeGreaterThanOrEqual(
        TEXT_MARGIN_LIMITS.min.right,
      );
      expect(result.margins.right).toBeLessThanOrEqual(
        TEXT_MARGIN_LIMITS.max.right,
      );
      expect(result.margins.bottom).toBeGreaterThanOrEqual(
        TEXT_MARGIN_LIMITS.min.bottom,
      );
      expect(result.margins.bottom).toBeLessThanOrEqual(
        TEXT_MARGIN_LIMITS.max.bottom,
      );
      expect(result.margins.left).toBeGreaterThanOrEqual(
        TEXT_MARGIN_LIMITS.min.left,
      );
      expect(result.margins.left).toBeLessThanOrEqual(
        TEXT_MARGIN_LIMITS.max.left,
      );
    });
  });

  describe('horizontal layout', () => {
    it('produces correct axis configurations', () => {
      const result = getBarChartLayout({
        ...baseParams,
        layout: BarChartLayout.HORIZONTAL,
      });

      expect(result.axisBottomConfiguration).toBeDefined();
      expect(result.axisLeftConfiguration).toBeDefined();
      expect(result.valueTickValues).toBeDefined();
      expect(result.valueDomain).toBeDefined();
    });

    it('returns margins within TEXT_MARGIN_LIMITS bounds', () => {
      const result = getBarChartLayout({
        ...baseParams,
        layout: BarChartLayout.HORIZONTAL,
      });

      expect(result.margins.top).toBeGreaterThanOrEqual(
        TEXT_MARGIN_LIMITS.min.top,
      );
      expect(result.margins.top).toBeLessThanOrEqual(
        TEXT_MARGIN_LIMITS.max.top,
      );
      expect(result.margins.right).toBeGreaterThanOrEqual(
        TEXT_MARGIN_LIMITS.min.right,
      );
      expect(result.margins.right).toBeLessThanOrEqual(
        TEXT_MARGIN_LIMITS.max.right,
      );
      expect(result.margins.bottom).toBeGreaterThanOrEqual(
        TEXT_MARGIN_LIMITS.min.bottom,
      );
      expect(result.margins.bottom).toBeLessThanOrEqual(
        TEXT_MARGIN_LIMITS.max.bottom,
      );
      expect(result.margins.left).toBeGreaterThanOrEqual(
        TEXT_MARGIN_LIMITS.min.left,
      );
      expect(result.margins.left).toBeLessThanOrEqual(
        TEXT_MARGIN_LIMITS.max.left,
      );
    });

    it('keeps explicit range bounds as value domain', () => {
      const result = getBarChartLayout({
        ...baseParams,
        chartWidth: 280,
        layout: BarChartLayout.HORIZONTAL,
        effectiveMinimumValue: 0,
        effectiveMaximumValue: 10,
        hasExplicitRangeBounds: true,
      });

      expect(result.valueDomain).toEqual({ min: 0, max: 10 });
      expect(result.valueTickValues[0]).toBe(0);
      expect(result.valueTickValues[result.valueTickValues.length - 1]).toBe(
        10,
      );
    });
  });

  describe('edge cases', () => {
    it('handles empty data array', () => {
      const result = getBarChartLayout({
        ...baseParams,
        layout: BarChartLayout.VERTICAL,
        data: [],
      });

      expect(result.margins).toBeDefined();
      expect(result.axisBottomConfiguration).toBeDefined();
      expect(result.axisLeftConfiguration).toBeDefined();
    });

    it('handles large value ranges with negative min and positive max', () => {
      const result = getBarChartLayout({
        ...baseParams,
        layout: BarChartLayout.VERTICAL,
        effectiveMinimumValue: -1000,
        effectiveMaximumValue: 5000,
      });

      expect(result.valueDomain.min).toBeLessThanOrEqual(-1000);
      expect(result.valueDomain.max).toBeGreaterThanOrEqual(5000);
      expect(result.valueTickValues.length).toBeGreaterThan(0);
    });

    it('handles single data point', () => {
      const result = getBarChartLayout({
        ...baseParams,
        layout: BarChartLayout.VERTICAL,
        data: [{ category: 'Single', value: 50 }],
      });

      expect(result.margins).toBeDefined();
      expect(result.valueTickValues.length).toBeGreaterThan(0);
    });

    it('handles missing axis labels', () => {
      const result = getBarChartLayout({
        ...baseParams,
        layout: BarChartLayout.VERTICAL,
        xAxisLabel: undefined,
        yAxisLabel: undefined,
      });

      expect(result.margins).toBeDefined();
      expect(result.axisBottomConfiguration).toBeDefined();
      expect(result.axisLeftConfiguration).toBeDefined();
    });
  });
});
