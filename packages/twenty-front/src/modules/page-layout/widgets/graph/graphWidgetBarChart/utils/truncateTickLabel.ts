import { COMMON_CHART_CONSTANTS } from '@/page-layout/widgets/graph/constants/CommonChartConstants';
import { ELLIPSIS_LENGTH } from '@/page-layout/widgets/graph/utils/ellipsisLength';
import { MIN_LABEL_LENGTH_FOR_TRUNCATION } from '@/page-layout/widgets/graph/utils/minLabelLengthForTruncation';

export const truncateTickLabel = (
  value: string | number,
  maxLength: number,
): string => {
  const stringValue = String(value);
  if (
    maxLength < MIN_LABEL_LENGTH_FOR_TRUNCATION ||
    stringValue.length <= maxLength
  ) {
    return stringValue;
  }

  const charsToShow = Math.max(
    COMMON_CHART_CONSTANTS.TICK_MINIMUM_NUMBER_OF_DISPLAYED_CHARACTERS,
    maxLength - ELLIPSIS_LENGTH,
  );
  return `${stringValue.slice(0, charsToShow)}...`;
};
