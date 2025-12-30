import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartConstants';
import { computeMinHeightPerTick } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeMinHeightPerTick';
import { BarChartLayout } from '~/generated/graphql';

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
      : BAR_CHART_CONSTANTS.MINIMUM_WIDTH_PER_TICK;

  return Math.max(1, Math.floor(axisSize / minTickSize));
};
