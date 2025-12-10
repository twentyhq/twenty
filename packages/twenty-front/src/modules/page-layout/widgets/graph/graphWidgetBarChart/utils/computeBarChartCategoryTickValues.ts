import { ROTATION_THRESHOLD_WIDTH } from '@/page-layout/widgets/graph/constants/RotationThresholdWidth';
import { BAR_CHART_MINIMUM_WIDTH_PER_TICK } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartMinimumWidthPerTick';
import { BAR_CHART_MINIMUM_WIDTH_PER_TICK_ROTATED } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartMinimumWidthPerTickRotated';
import { BarChartLayout } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartLayout';
import { computeMinHeightPerTick } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeMinHeightPerTick';
import { getBarChartMargins } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getBarChartMargins';
import { computeChartCategoryTickValues } from '@/page-layout/widgets/graph/utils/computeChartCategoryTickValues';
import { type BarDatum } from '@nivo/bar';

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

  const widthPerDataPoint =
    layout === BarChartLayout.VERTICAL && data.length > 0
      ? availableAxisSize / data.length
      : 0;

  const willRotate =
    layout === BarChartLayout.VERTICAL &&
    widthPerDataPoint < ROTATION_THRESHOLD_WIDTH;

  const minimumSizePerTick =
    layout === BarChartLayout.VERTICAL
      ? willRotate
        ? BAR_CHART_MINIMUM_WIDTH_PER_TICK_ROTATED
        : BAR_CHART_MINIMUM_WIDTH_PER_TICK
      : computeMinHeightPerTick({ axisFontSize });

  return computeChartCategoryTickValues({
    availableSize: availableAxisSize,
    minimumSizePerTick,
    values,
  });
};
