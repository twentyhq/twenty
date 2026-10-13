import { type Temporal } from 'temporal-polyfill';
import {
  isPlainDateAfter,
  isPlainDateBeforeOrEqual,
  parseToPlainDateOrThrow,
} from 'twenty-shared/utils';

import { type ApplicationRegistrationAnalyticsTimeSeriesPointDTO } from 'src/engine/core-modules/application/application-registration-analytics/dtos/application-registration-analytics.dto';
import { type ApplicationRegistrationAnalyticsCounts } from 'src/engine/core-modules/application/application-registration-analytics/types/application-registration-analytics-counts.type';
import {
  addMetricRowToApplicationRegistrationAnalyticsCounts,
  type ApplicationRegistrationMetricSumRow,
} from 'src/engine/core-modules/application/application-registration-analytics/utils/add-metric-row-to-application-registration-analytics-counts.util';
import { createEmptyApplicationRegistrationAnalyticsCounts } from 'src/engine/core-modules/application/application-registration-analytics/utils/create-empty-application-registration-analytics-counts.util';

export type ApplicationRegistrationMetricDailySumRow =
  ApplicationRegistrationMetricSumRow & {
    date: string;
  };

// One point per calendar day of the period, so charts never skip quiet days
export const buildApplicationRegistrationAnalyticsTimeSeries = ({
  rows,
  periodStart,
  periodEnd,
}: {
  rows: ApplicationRegistrationMetricDailySumRow[];
  periodStart: Date;
  periodEnd: Date;
}): ApplicationRegistrationAnalyticsTimeSeriesPointDTO[] => {
  const startDate = parseToPlainDateOrThrow(periodStart.toISOString());
  const lastIncludedInstant = new Date(periodEnd.getTime() - 1);
  const endDate = parseToPlainDateOrThrow(lastIncludedInstant.toISOString());

  if (isPlainDateAfter(startDate, endDate)) {
    return [];
  }

  const countsByDate = new Map<
    string,
    ApplicationRegistrationAnalyticsCounts
  >();

  for (const row of rows) {
    const counts =
      countsByDate.get(row.date) ??
      createEmptyApplicationRegistrationAnalyticsCounts();

    countsByDate.set(
      row.date,
      addMetricRowToApplicationRegistrationAnalyticsCounts({ counts, row }),
    );
  }

  const points: ApplicationRegistrationAnalyticsTimeSeriesPointDTO[] = [];
  let currentDateCursor: Temporal.PlainDate = startDate;

  while (isPlainDateBeforeOrEqual(currentDateCursor, endDate)) {
    const date = currentDateCursor.toString();

    points.push({
      date,
      ...(countsByDate.get(date) ??
        createEmptyApplicationRegistrationAnalyticsCounts()),
    });
    currentDateCursor = currentDateCursor.add({ days: 1 });
  }

  return points;
};
