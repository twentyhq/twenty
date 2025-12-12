import { LINE_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetLineChart/constants/LineChartConstants';
import { type LineChartSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartSeries';
import { computeChartCategoryTickValues } from '@/page-layout/widgets/graph/utils/computeChartCategoryTickValues';

export const computeLineChartCategoryTickValues = ({
  width,
  data,
  marginLeft,
  marginRight,
}: {
  width: number;
  data: LineChartSeries[];
  marginLeft: number;
  marginRight: number;
}): (string | number)[] => {
  if (data.length === 0 || data[0].data.length === 0) {
    return [];
  }

  const values = data[0].data.map((point) => {
    const value = point.x;
    return typeof value === 'number' || typeof value === 'string'
      ? value
      : String(value);
  });

  const availableWidth = width - (marginLeft + marginRight);

  const dataPointCount = data[0].data.length;
  const widthPerTick = dataPointCount > 0 ? availableWidth / dataPointCount : 0;

  return computeChartCategoryTickValues({
    availableSize: availableWidth,
    minimumSizePerTick: LINE_CHART_CONSTANTS.MINIMUM_WIDTH_PER_TICK_ROTATED,
    values,
    widthPerTick,
  });
};
