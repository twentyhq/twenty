import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartConstants';
import { computeMinHeightPerTick } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeMinHeightPerTick';
import { getBarChartMargins } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getBarChartMargins';
import { computeChartCategoryTickValues } from '@/page-layout/widgets/graph/utils/computeChartCategoryTickValues';
import { type BarDatum } from '@nivo/bar';
import { BarChartLayout } from '~/generated/graphql';

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
  data: BarDatum[];
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

  if (layout === BarChartLayout.HORIZONTAL) {
    return computeChartCategoryTickValues({
      availableSize: availableAxisSize,
      minimumSizePerTick: computeMinHeightPerTick({ axisFontSize }),
      values,
    });
  }

  const widthPerTick = data.length > 0 ? availableAxisSize / data.length : 0;

  return computeChartCategoryTickValues({
    availableSize: availableAxisSize,
    minimumSizePerTick: BAR_CHART_CONSTANTS.MINIMUM_WIDTH_PER_TICK_ROTATED,
    values,
    widthPerTick,
  });
};
