import { COMMON_CHART_CONSTANTS } from '@/page-layout/widgets/graph/constants/CommonChartConstants';

export const computeMaxLabelLengthForMargin = ({
  marginSize,
  axisFontSize,
}: {
  marginSize: number;
  axisFontSize: number;
}): number => {
  const characterWidth =
    axisFontSize *
    COMMON_CHART_CONSTANTS.HORIZONTAL_LABEL_CHARACTER_WIDTH_RATIO;
  const availableWidth =
    marginSize - COMMON_CHART_CONSTANTS.TICK_PADDING_ALLOWANCE;
  const calculatedLength = Math.max(
    COMMON_CHART_CONSTANTS.TICK_MINIMUM_NUMBER_OF_DISPLAYED_CHARACTERS,
    Math.floor(availableWidth / characterWidth),
  );

  return calculatedLength;
};
