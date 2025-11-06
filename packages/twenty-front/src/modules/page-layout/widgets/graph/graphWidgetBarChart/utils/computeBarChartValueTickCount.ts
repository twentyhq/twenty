import { BAR_CHART_MINIMUM_WIDTH_PER_TICK } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartMinimumWidthPerTick';
import { computeMinHeightPerTick } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeMinHeightPerTick';

type ComputeBarChartValueTickCountProps = {
  axisSize: number;
  axisFontSize: number;
  layout: 'vertical' | 'horizontal';
};

export const computeBarChartValueTickCount = ({
  axisSize,
  axisFontSize,
  layout,
}: ComputeBarChartValueTickCountProps): number => {
  const minTickSize =
    layout === 'vertical'
      ? BAR_CHART_MINIMUM_WIDTH_PER_TICK
      : computeMinHeightPerTick({ axisFontSize });

  return Math.max(1, Math.floor(axisSize / minTickSize));
};
