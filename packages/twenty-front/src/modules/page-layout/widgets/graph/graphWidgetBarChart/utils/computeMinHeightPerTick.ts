import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartConstants';

export const computeMinHeightPerTick = ({
  axisFontSize,
}: {
  axisFontSize: number;
}): number => {
  return axisFontSize * BAR_CHART_CONSTANTS.MIN_TICK_SPACING_HEIGHT_RATIO;
};
