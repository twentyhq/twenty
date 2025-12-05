import { ELLIPSIS_LENGTH } from '@/page-layout/widgets/graph/utils/ellipsisLength';
import { MIN_DISPLAY_CHARS } from '@/page-layout/widgets/graph/utils/minDisplayChars';
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

  const charsToShow = Math.max(MIN_DISPLAY_CHARS, maxLength - ELLIPSIS_LENGTH);
  return `${stringValue.slice(0, charsToShow)}...`;
};
