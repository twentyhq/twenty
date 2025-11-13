import { BAR_CHART_MIN_TICK_SPACING_HEIGHT_RATIO } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartMinTickSpacingHeightRatio';

export const computeMinHeightPerTick = ({
  axisFontSize,
}: {
  axisFontSize: number;
}): number => {
  return axisFontSize * BAR_CHART_MIN_TICK_SPACING_HEIGHT_RATIO;
};
