import { COMMON_CHART_CONSTANTS } from '@/page-layout/widgets/graph/constants/CommonChartConstants';

export const calculateMaxTickLabelLength = ({
  widthPerTick,
  axisFontSize,
}: {
  widthPerTick: number;
  axisFontSize: number;
}): number => {
  const averageCharacterWidth =
    axisFontSize *
    COMMON_CHART_CONSTANTS.HORIZONTAL_LABEL_CHARACTER_WIDTH_RATIO;
  const calculatedLength = Math.floor(widthPerTick / averageCharacterWidth);

  return Math.max(
    COMMON_CHART_CONSTANTS.MIN_TICK_LABEL_LENGTH,
    calculatedLength,
  );
};
