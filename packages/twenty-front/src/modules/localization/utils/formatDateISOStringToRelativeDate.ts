import {
  differenceInCalendarDays,
  differenceInCalendarMonths,
  differenceInCalendarWeeks,
  differenceInCalendarYears,
  differenceInHours,
  differenceInMinutes,
} from 'date-fns';

type TimeUnit = 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute';

type TimeInterval = { unit: TimeUnit; value: number; maxAbsValue?: number };

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

  const timeIntervals: TimeInterval[] = [
    { unit: 'year' as const, value: differenceInCalendarYears(date, now) },
    {
      unit: 'month' as const,
      value: differenceInCalendarMonths(date, now),
      maxAbsValue: 12,
    },
    {
      unit: 'week' as const,
      value: differenceInCalendarWeeks(date, now),
      maxAbsValue: 4,
    },
    {
      unit: 'day' as const,
      value: differenceInCalendarDays(date, now),
      maxAbsValue: 7,
    },
    {
      unit: 'hour' as const,
      value: differenceInHours(date, now),
      maxAbsValue: 24,
    },
    {
      unit: 'minute' as const,
      value: differenceInMinutes(date, now),
      maxAbsValue: 60,
    },
  ];

  const timeIntervalsUpToMaximumPrecision = (
    isDayMaximumPrecision ? timeIntervals.slice(0, -2) : timeIntervals
  ).filter(
    (interval) =>
      interval.maxAbsValue === undefined ||
      Math.abs(interval.value) < interval.maxAbsValue,
  );

  const displayInterval = timeIntervalsUpToMaximumPrecision.findLast(
    (interval) => {
      return Math.abs(interval.value) > 0;
    },
  );

  const isPast = date.getTime() < now;

  if (displayInterval !== undefined) {
    const specialName = specialNamesByOffsetByTimeUnit
      .get(displayInterval?.unit)
      ?.get(displayInterval?.value);

    if (specialName !== undefined) return specialName;

    const dateAndUnitText = `${Math.abs(displayInterval.value)} ${displayInterval.unit}${
      Math.abs(displayInterval.value) > 1 ? 's' : ''
    }`;

    if (isPast) {
      return `${dateAndUnitText} ago`;
    }

    return `In ${dateAndUnitText}`;
  }

  if (!isDayMaximumPrecision) {
    return `Just now`;
  }

  return 'Today';
};
