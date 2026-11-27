import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

export const formatUtcDateTime = (
  dateTime: string | undefined,
): string | undefined => {
  if (!isNonEmptyString(dateTime)) {
    return undefined;
  }

  const date = new Date(dateTime);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  const monthLabel = MONTH_LABELS[date.getUTCMonth()];
  const dayOfMonth = date.getUTCDate();
  const year = date.getUTCFullYear();
  const hourOfDay = date.getUTCHours();
  const hourWithinHalfDay = hourOfDay % 12 === 0 ? 12 : hourOfDay % 12;
  const minuteLabel = date.getUTCMinutes().toString().padStart(2, '0');
  const meridiemLabel = hourOfDay < 12 ? 'AM' : 'PM';

  return `${monthLabel} ${dayOfMonth}, ${year}, ${hourWithinHalfDay}:${minuteLabel} ${meridiemLabel} UTC`;
};
