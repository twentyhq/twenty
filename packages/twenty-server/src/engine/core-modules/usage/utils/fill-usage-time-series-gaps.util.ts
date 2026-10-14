import { type Temporal } from 'temporal-polyfill';
import {
  isPlainDateAfter,
  isPlainDateBeforeOrEqual,
  parseToPlainDateOrThrow,
} from 'twenty-shared/utils';

import { type UsageTimeSeriesPoint } from 'src/engine/core-modules/usage/services/usage-analytics.service';

type FillUsageTimeSeriesGapsParams = {
  rows: UsageTimeSeriesPoint[];
  periodStart: Date;
  periodEnd: Date;
};

export const fillUsageTimeSeriesGaps = ({
  rows,
  periodStart,
  periodEnd,
}: FillUsageTimeSeriesGapsParams): UsageTimeSeriesPoint[] => {
  const startDate = parseToPlainDateOrThrow(periodStart.toISOString());
  const lastIncludedInstant = new Date(periodEnd.getTime() - 1);
  const endDate = parseToPlainDateOrThrow(lastIncludedInstant.toISOString());

  if (isPlainDateAfter(startDate, endDate)) {
    return [];
  }

  const rowsByDate = new Map<string, UsageTimeSeriesPoint>();

  for (const row of rows) {
    rowsByDate.set(row.date, row);
  }

  const filled: UsageTimeSeriesPoint[] = [];
  let currentDateCursor: Temporal.PlainDate = startDate;

  while (isPlainDateBeforeOrEqual(currentDateCursor, endDate)) {
    const key = currentDateCursor.toString();
    const existing = rowsByDate.get(key);

    filled.push(existing ?? { date: key, creditsUsed: 0 });
    currentDateCursor = currentDateCursor.add({ days: 1 });
  }

  return filled;
};
