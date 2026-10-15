import { type Temporal } from 'temporal-polyfill';
import {
  isPlainDateBeforeOrEqual,
  parseToPlainDateOrThrow,
} from 'twenty-shared/utils';

export const getApplicationRegistrationAnalyticsPeriodDates = ({
  periodStart,
  periodEnd,
}: {
  periodStart: Date;
  periodEnd: Date;
}): string[] => {
  const startDate = parseToPlainDateOrThrow(periodStart.toISOString());
  const lastIncludedInstant = new Date(periodEnd.getTime() - 1);
  const endDate = parseToPlainDateOrThrow(lastIncludedInstant.toISOString());

  const dates: string[] = [];
  let currentDateCursor: Temporal.PlainDate = startDate;

  while (isPlainDateBeforeOrEqual(currentDateCursor, endDate)) {
    dates.push(currentDateCursor.toString());
    currentDateCursor = currentDateCursor.add({ days: 1 });
  }

  return dates;
};
