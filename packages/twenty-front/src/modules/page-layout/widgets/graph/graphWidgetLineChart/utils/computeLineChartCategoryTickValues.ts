import { type LineChartSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartSeries';
import { computeCategoryTickValues } from '@/page-layout/widgets/graph/utils/computeCategoryTickValues';

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
  if (data.length === 0 || data[0].data.length === 0) return [];

  const values = data[0].data.map((point) => point.x);
  const availableWidth =
    width - (LINE_CHART_MARGIN_LEFT + LINE_CHART_MARGIN_RIGHT);
  const numberOfTicks = Math.floor(
    availableWidth / LINE_CHART_MINIMUM_WIDTH_PER_TICK,
  );

  const tickIndices = computeCategoryTickValues(numberOfTicks, values.length);

  return tickIndices.map((index) => {
    const value = values[index];
    return typeof value === 'number' || typeof value === 'string'
      ? value
      : String(value);
  });
};
