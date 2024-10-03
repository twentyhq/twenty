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
  const targetDate = new Date(isoDate);

  if (isDayMaximumPrecision && isToday(targetDate)) return 'Today';

  const isWithin24h = Math.abs(differenceInDays(targetDate, now)) < 1;

  if (isDayMaximumPrecision || !isWithin24h)
    return formatDistance(startOfDay(targetDate), startOfDay(now), {
      addSuffix: true,
    });

  return formatDistance(targetDate, now, { addSuffix: true });
};
