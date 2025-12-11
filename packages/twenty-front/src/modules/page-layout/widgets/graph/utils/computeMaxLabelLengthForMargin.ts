import { COMMON_CHART_CONSTANTS } from '@/page-layout/widgets/graph/constants/CommonChartConstants';
import { ELLIPSIS_LENGTH } from '@/page-layout/widgets/graph/utils/ellipsisLength';
import { MIN_LABEL_LENGTH_FOR_TRUNCATION } from '@/page-layout/widgets/graph/utils/minLabelLengthForTruncation';

const CHARACTER_WIDTH_RATIO = 0.6;
const TICK_PADDING_ALLOWANCE = 10;

export const computeMaxLabelLengthForMargin = ({
  marginSize,
  axisFontSize,
}: {
  marginSize: number;
  axisFontSize: number;
}): number => {
  const characterWidth = axisFontSize * CHARACTER_WIDTH_RATIO;
  const availableWidth = marginSize - TICK_PADDING_ALLOWANCE;
  const calculatedLength = Math.max(
    COMMON_CHART_CONSTANTS.TICK_MINIMUM_NUMBER_OF_DISPLAYED_CHARACTERS +
      ELLIPSIS_LENGTH,
    Math.floor(availableWidth / characterWidth),
  );

  return Math.max(MIN_LABEL_LENGTH_FOR_TRUNCATION, calculatedLength);
};
