import {
  differenceInDays,
  formatDistance,
  isToday,
  startOfDay,
} from 'date-fns';

export const formatDateISOStringToRelativeDate = (
  isoDate: string,
  isDayMaximumPrecision = false,
) => {
  const now = new Date();
  const targetDate = new Date(Date.parse(isoDate));

  if (isDayMaximumPrecision && isToday(targetDate)) {
    return 'Today';
  }

  if (
    isDayMaximumPrecision ||
    Math.abs(differenceInDays(targetDate, now)) > 0
  ) {
    const startOfToday = startOfDay(now);
    const startOfTargetDate = startOfDay(targetDate);

    return formatDistance(startOfTargetDate, startOfToday, {
      addSuffix: true,
    });
  }

  return formatDistance(targetDate, now, { addSuffix: true });
};
