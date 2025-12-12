import { ELLIPSIS_LENGTH } from '@/page-layout/widgets/graph/utils/ellipsisLength';

export const truncateTickLabel = (
  value: string | number,
  maxLength: number,
): string => {
  const stringValue = String(value);

  if (stringValue.length <= maxLength) {
    return stringValue;
  }

  if (maxLength <= ELLIPSIS_LENGTH) {
    return '...'.slice(0, maxLength);
  }

  return `${stringValue.slice(0, maxLength - ELLIPSIS_LENGTH)}...`;
};
