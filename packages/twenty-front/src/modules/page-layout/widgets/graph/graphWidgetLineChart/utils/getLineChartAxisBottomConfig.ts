import { type LineChartSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartSeries';
import { computeLineChartCategoryTickValues } from '@/page-layout/widgets/graph/graphWidgetLineChart/utils/computeLineChartCategoryTickValues';

export const getLineChartAxisBottomConfig = (
  xAxisLabel?: string,
  width?: number,
  data?: LineChartSeries[],
) => {
  const tickValues =
    width && data
      ? computeLineChartCategoryTickValues({ width, data })
      : undefined;

  return {
    tickSize: 0,
    tickPadding: 5,
    tickRotation: 0,
    tickValues,
    legend: xAxisLabel,
    legendPosition: 'middle' as const,
    legendOffset: 40,
  };
};
