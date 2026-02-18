import { COMMON_CHART_CONSTANTS } from '@/page-layout/widgets/graph/constants/CommonChartConstants';
import { TEXT_MARGIN_LIMITS } from '@/page-layout/widgets/graph/constants/TextMarginLimits';
import { type LineChartSeriesWithColor } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartSeriesWithColor';
import { getLineChartLayout } from '@/page-layout/widgets/graph/graphWidgetLineChart/utils/getLineChartLayout';
import { type ChartAxisTheme } from '@/page-layout/widgets/graph/types/ChartAxisTheme';
import { type GraphValueFormatOptions } from '@/page-layout/widgets/graph/utils/graphFormatters';

describe('getLineChartLayout', () => {
  const defaultAxisTheme: ChartAxisTheme = {
    ticks: { text: { fontSize: 11 } },
    legend: { text: { fontSize: 11 } },
  };

  const defaultFormatOptions: GraphValueFormatOptions = {
    displayType: 'number',
  };

  const defaultData: LineChartSeriesWithColor[] = [
    {
      id: 'series1',
      label: 'Series 1',
      data: [
        { x: '2024-01', y: 10 },
        { x: '2024-02', y: 20 },
        { x: '2024-03', y: 30 },
      ],
    },
  ];

  const baseParams = {
    axisTheme: defaultAxisTheme,
    chartWidth: 500,
    data: defaultData,
    xAxisLabel: 'Date',
    yAxisLabel: 'Value',
    formatOptions: defaultFormatOptions,
    effectiveMinimumValue: 0,
    effectiveMaximumValue: 30,
  };

  it('produces correct axis configurations', () => {
    const result = getLineChartLayout(baseParams);

    expect(result.axisBottomConfiguration).toBeDefined();
    expect(result.axisLeftConfiguration).toBeDefined();
    expect(result.valueTickValues).toBeDefined();
    expect(result.valueDomain).toBeDefined();
  });

  it('returns margins within TEXT_MARGIN_LIMITS bounds', () => {
    const result = getLineChartLayout(baseParams);

    expect(result.margins.top).toBeGreaterThanOrEqual(
      TEXT_MARGIN_LIMITS.min.top,
    );
    expect(result.margins.top).toBeLessThanOrEqual(TEXT_MARGIN_LIMITS.max.top);
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

  it('handles empty data array', () => {
    const result = getLineChartLayout({
      ...baseParams,
      data: [],
    });

    expect(result.margins).toBeDefined();
    expect(result.axisBottomConfiguration).toBeDefined();
    expect(result.axisLeftConfiguration).toBeDefined();
  });

  it('handles single data point series', () => {
    const result = getLineChartLayout({
      ...baseParams,
      data: [
        {
          id: 'series1',
          label: 'Series 1',
          data: [{ x: '2024-01', y: 50 }],
        },
      ],
    });

    expect(result.margins).toBeDefined();
    expect(result.valueTickValues.length).toBeGreaterThan(0);
  });

  it('axisLeftConfiguration.legendOffset is correct relative to margins.left', () => {
    const result = getLineChartLayout(baseParams);

    const legendOffset = result.axisLeftConfiguration.legendOffset;

    if (legendOffset !== undefined) {
      expect(Math.abs(legendOffset)).toBeLessThanOrEqual(
        result.margins.left -
          COMMON_CHART_CONSTANTS.LEFT_AXIS_LEGEND_OFFSET_PADDING,
      );
    }
  });

  it('handles multiple series', () => {
    const result = getLineChartLayout({
      ...baseParams,
      data: [
        {
          id: 'series1',
          label: 'Series 1',
          data: [
            { x: '2024-01', y: 10 },
            { x: '2024-02', y: 20 },
          ],
        },
        {
          id: 'series2',
          label: 'Series 2',
          data: [
            { x: '2024-01', y: 15 },
            { x: '2024-02', y: 25 },
          ],
        },
      ],
    });

    expect(result.margins).toBeDefined();
    expect(result.axisBottomConfiguration).toBeDefined();
  });

  it('handles missing axis labels', () => {
    const result = getLineChartLayout({
      ...baseParams,
      xAxisLabel: undefined,
      yAxisLabel: undefined,
    });

    expect(result.margins).toBeDefined();
    expect(result.axisBottomConfiguration).toBeDefined();
    expect(result.axisLeftConfiguration).toBeDefined();
  });

  it('handles large value ranges with negative and positive values', () => {
    const result = getLineChartLayout({
      ...baseParams,
      effectiveMinimumValue: -500,
      effectiveMaximumValue: 1000,
    });

    expect(result.valueDomain.min).toBeLessThanOrEqual(-500);
    expect(result.valueDomain.max).toBeGreaterThanOrEqual(1000);
    expect(result.valueTickValues.length).toBeGreaterThan(0);
  });
});
