import { BAR_CHART_MINIMUM_WIDTH_PER_TICK } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartMinimumWidthPerTick';
import { type BarChartDataItem } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDataItem';
import { BarChartLayout } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartLayout';
import { computeMinHeightPerTick } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeMinHeightPerTick';
import { getBarChartMargins } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getBarChartMargins';

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
  if (axisSize === 0 || data.length === 0) return [];

  const margins = getBarChartMargins({ xAxisLabel, yAxisLabel, layout });

  const totalMargins =
    layout === BarChartLayout.VERTICAL
      ? margins.left + margins.right
      : margins.top + margins.bottom;

  const availableAxisSize = axisSize - totalMargins;

  const numberOfTicks = Math.floor(
    availableAxisSize /
      (layout === BarChartLayout.VERTICAL
        ? BAR_CHART_MINIMUM_WIDTH_PER_TICK
        : computeMinHeightPerTick({ axisFontSize })),
  );

  if (numberOfTicks <= 0) return [];
  if (numberOfTicks === 1) return [data[0][indexBy] as string | number];
  if (numberOfTicks >= data.length)
    return data.map((item) => item[indexBy] as string | number);

  const step = (data.length - 1) / (numberOfTicks - 1);

  return Array.from({ length: numberOfTicks }, (_, i) => {
    const index = Math.min(Math.round(i * step), data.length - 1);
    return data[index][indexBy] as string | number;
  });
};
