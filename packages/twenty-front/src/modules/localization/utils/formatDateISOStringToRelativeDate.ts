import {
  differenceInCalendarDays,
  differenceInCalendarMonths,
  differenceInCalendarWeeks,
  differenceInCalendarYears,
  differenceInHours,
  differenceInMinutes,
} from 'date-fns';

type TimeUnit = 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute';

const yearSpecialNamesByOffset = new Map([
  [-1, 'Last year'],
  [0, 'This year'],
  [1, 'Next year'],
]);

const monthSpecialNamesByOffset = new Map([
  [-1, 'Last month'],
  [0, 'This month'],
  [1, 'Next month'],
]);

const weekSpecialNamesByOffset = new Map([
  [-1, 'Last week'],
  [0, 'This week'],
  [1, 'Next week'],
]);

const daySpecialNamesByOffset = new Map([
  [-1, 'Yesterday'],
  [0, 'Today'],
  [1, 'Tomorrow'],
]);

const specialNamesByOffsetByTimeUnit = new Map<TimeUnit, Map<number, string>>([
  ['year', yearSpecialNamesByOffset],
  ['month', monthSpecialNamesByOffset],
  ['week', weekSpecialNamesByOffset],
  ['day', daySpecialNamesByOffset],
]);

export const formatDateISOStringToRelativeDate = (
  isoDate: string,
  isDayMaximumPrecision = false,
) => {
  const date = new Date(Date.parse(isoDate));

  const now = Date.now();

  const timeIntervals: { unit: TimeUnit; value: number }[] = [
    { unit: 'year', value: differenceInCalendarYears(date, now) },
    { unit: 'month', value: differenceInCalendarMonths(date, now) },
    { unit: 'week', value: differenceInCalendarWeeks(date, now) },
    { unit: 'day', value: differenceInCalendarDays(date, now) },
    { unit: 'hour', value: differenceInHours(date, now) },
    { unit: 'minute', value: differenceInMinutes(date, now) },
  ];

  const dayIndex = timeIntervals.findIndex((i) => i.unit === 'day');

  const timeIntervalsUpToMaximumPrecision = isDayMaximumPrecision
    ? timeIntervals.slice(0, dayIndex + 1)
    : timeIntervals;

  const displayInterval = timeIntervalsUpToMaximumPrecision.find(
    (interval, i) => {
      const isLast = i === timeIntervalsUpToMaximumPrecision.length - 1;

      return isLast
        ? Math.abs(interval.value) > 0
        : Math.abs(interval.value) > 1;
    },
  );

  const isPast2 = date.getTime() < now;

  if (displayInterval !== undefined) {
    const specialName = specialNamesByOffsetByTimeUnit
      .get(displayInterval?.unit)
      ?.get(displayInterval?.value);

    if (specialName !== undefined) return specialName;

    const dateAndUnitText = `${Math.abs(displayInterval.value)} ${displayInterval.unit}${
      Math.abs(displayInterval.value) > 1 ? 's' : ''
    }`;

    if (isPast2) {
      return `${dateAndUnitText} ago`;
    }

    return `In ${dateAndUnitText}`;
  }

  if (!isDayMaximumPrecision) {
    return `Just now ${isPast2 ? 'is Past' : 'is Future'}`;
  }

  return 'Today';
};
