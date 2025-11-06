import { type BarChartDataItem } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDataItem';
import { getBarChartMargins } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getBarChartMargins';
import { computeCategoryTickValues } from '@/page-layout/widgets/graph/utils/computeCategoryTickValues';

export const computeBarChartCategoryTickValues = ({
  width,
  data,
  indexBy,
  xAxisLabel,
  yAxisLabel,
  layout,
}: {
  width: number;
  data: BarChartDataItem[];
  indexBy: string;
  layout: 'vertical' | 'horizontal';
  xAxisLabel?: string;
  yAxisLabel?: string;
}): (string | number | Date)[] => {
  const margins = getBarChartMargins({ xAxisLabel, yAxisLabel, layout });
  const values = data.map((item) => item[indexBy]);

  return computeCategoryTickValues({
    width,
    values,
    leftMargin: margins.left,
    rightMargin: margins.right,
  });
};
