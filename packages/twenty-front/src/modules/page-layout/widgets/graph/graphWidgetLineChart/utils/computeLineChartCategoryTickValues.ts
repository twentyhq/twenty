import { type LineChartSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartSeries';
import { computeCategoryTickValues } from '@/page-layout/widgets/graph/utils/computeCategoryTickValues';

const LINE_CHART_MARGIN_LEFT = 70;
const LINE_CHART_MARGIN_RIGHT = 20;

export const computeLineChartCategoryTickValues = ({
  width,
  data,
}: {
  width: number;
  data: LineChartSeries[];
}): (string | number | Date)[] => {
  if (data.length === 0 || data[0].data.length === 0) return [];

  const values = data[0].data.map((point) => point.x);

  return computeCategoryTickValues({
    width,
    values,
    leftMargin: LINE_CHART_MARGIN_LEFT,
    rightMargin: LINE_CHART_MARGIN_RIGHT,
  });
};
