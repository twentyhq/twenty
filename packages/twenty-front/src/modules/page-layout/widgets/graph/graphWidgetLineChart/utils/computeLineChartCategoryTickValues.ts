import { ROTATION_THRESHOLD_WIDTH } from '@/page-layout/widgets/graph/constants/RotationThresholdWidth';
import { LINE_CHART_MINIMUM_WIDTH_PER_TICK_ROTATED } from '@/page-layout/widgets/graph/graphWidgetLineChart/constants/LineChartMinimumWidthPerTickRotated';
import { type LineChartSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartSeries';
import { computeChartCategoryTickValues } from '@/page-layout/widgets/graph/utils/computeChartCategoryTickValues';

const LINE_CHART_MARGIN_LEFT = 70;
const LINE_CHART_MARGIN_RIGHT = 20;
const LINE_CHART_MINIMUM_WIDTH_PER_TICK = 100;

export const computeLineChartCategoryTickValues = ({
  width,
  data,
}: {
  width: number;
  data: LineChartSeries[];
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

  const availableWidth =
    width - (LINE_CHART_MARGIN_LEFT + LINE_CHART_MARGIN_RIGHT);

  const dataPointCount = data[0].data.length;
  const widthPerDataPoint =
    dataPointCount > 0 ? availableWidth / dataPointCount : 0;

  const willRotate = widthPerDataPoint < ROTATION_THRESHOLD_WIDTH;

  const minimumSizePerTick = willRotate
    ? LINE_CHART_MINIMUM_WIDTH_PER_TICK_ROTATED
    : LINE_CHART_MINIMUM_WIDTH_PER_TICK;

  return computeChartCategoryTickValues({
    availableSize: availableWidth,
    minimumSizePerTick,
    values,
  });
};
