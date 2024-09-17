import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  subDays,
  subMonths,
  subWeeks,
  subYears,
} from 'date-fns';
import { DateFilterValue } from '../types/DateFilterValue';

const getRelativeDate = (dateFilterValue: DateFilterValue): Date => {
  if (dateFilterValue.type !== 'relative') {
    throw new Error('Date filter value is not relative');
  }

  const now = new Date();
  switch (dateFilterValue.unit) {
    case 'day':
      return dateFilterValue.direction === 'past'
        ? subDays(now, dateFilterValue.amount)
        : addDays(now, dateFilterValue.amount);
    case 'week':
      return dateFilterValue.direction === 'past'
        ? subWeeks(now, dateFilterValue.amount)
        : addWeeks(now, dateFilterValue.amount);
    case 'month':
      return dateFilterValue.direction === 'past'
        ? subMonths(now, dateFilterValue.amount)
        : addMonths(now, dateFilterValue.amount);
    case 'year':
      return dateFilterValue.direction === 'past'
        ? subYears(now, dateFilterValue.amount)
        : addYears(now, dateFilterValue.amount);
    default:
      throw new Error(
        `Unsupported relative date unit: ${dateFilterValue.unit}`,
      );
  }
};

export const getDateFromDateFilterValue = (
  dateFilterValue: DateFilterValue,
) => {
  switch (dateFilterValue.type) {
    case 'absolute':
      return new Date(dateFilterValue.isoString);
    case 'relative':
      return getRelativeDate(dateFilterValue);
    default:
      throw new Error(
        `Unsupported date filter type: ${(dateFilterValue as any).type}`,
      );
  }
};
