import { BAR_CHART_MINIMUM_WIDTH_PER_TICK } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartMinimumWidthPerTick';
import { BarChartLayout } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartLayout';
import { computeMinHeightPerTick } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeMinHeightPerTick';

type ComputeBarChartValueTickCountProps = {
  axisSize: number;
  axisFontSize: number;
  layout: BarChartLayout;
};

export const computeBarChartValueTickCount = ({
  axisSize,
  axisFontSize,
  layout,
}: ComputeBarChartValueTickCountProps): number => {
  const minTickSize =
    layout === BarChartLayout.VERTICAL
      ? computeMinHeightPerTick({ axisFontSize })
      : BAR_CHART_MINIMUM_WIDTH_PER_TICK;

  return Math.max(1, Math.floor(axisSize / minTickSize));
};
