import { BAR_CHART_MINIMUM_WIDTH_PER_TICK } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartMinimumWidthPerTick';
import { type BarChartDataItem } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDataItem';
import { BarChartLayout } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartLayout';
import { computeMinHeightPerTick } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeMinHeightPerTick';
import { getBarChartMargins } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getBarChartMargins';
import { computeChartCategoryTickValues } from '@/page-layout/widgets/graph/utils/computeChartCategoryTickValues';

export const computeBarChartCategoryTickValues = ({
  axisSize,
  axisFontSize,
  data,
  indexBy,
  xAxisLabel,
  yAxisLabel,
  layout,
}: {
  axisSize: number;
  axisFontSize: number;
  data: BarChartDataItem[];
  indexBy: string;
  layout: BarChartLayout;
  xAxisLabel?: string;
  yAxisLabel?: string;
}): (string | number)[] => {
  if (axisSize === 0 || data.length === 0) {
    return [];
  }

  const values = data.map((item) => item[indexBy] as string | number);

  const margins = getBarChartMargins({ xAxisLabel, yAxisLabel, layout });

  const totalMargins =
    layout === BarChartLayout.VERTICAL
      ? margins.left + margins.right
      : margins.top + margins.bottom;

  const availableAxisSize = axisSize - totalMargins;

  const minimumSizePerTick =
    layout === BarChartLayout.VERTICAL
      ? BAR_CHART_MINIMUM_WIDTH_PER_TICK
      : computeMinHeightPerTick({ axisFontSize });

  return computeChartCategoryTickValues({
    availableSize: availableAxisSize,
    minimumSizePerTick,
    values,
  });
};
