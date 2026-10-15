import { type ApplicationRegistrationAnalyticsTimeSeriesPointDTO } from 'src/engine/core-modules/application/application-registration-analytics/dtos/application-registration-analytics.dto';
import { type ApplicationRegistrationAnalyticsCounts } from 'src/engine/core-modules/application/application-registration-analytics/types/application-registration-analytics-counts.type';
import { type ApplicationRegistrationMetricDailySumRow } from 'src/engine/core-modules/application/application-registration-analytics/types/application-registration-metric-daily-sum-row.type';
import { addMetricRowToApplicationRegistrationAnalyticsCounts } from 'src/engine/core-modules/application/application-registration-analytics/utils/add-metric-row-to-application-registration-analytics-counts.util';
import { createEmptyApplicationRegistrationAnalyticsCounts } from 'src/engine/core-modules/application/application-registration-analytics/utils/create-empty-application-registration-analytics-counts.util';
import { getApplicationRegistrationAnalyticsPeriodDates } from 'src/engine/core-modules/application/application-registration-analytics/utils/get-application-registration-analytics-period-dates.util';

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

  return getApplicationRegistrationAnalyticsPeriodDates({
    periodStart,
    periodEnd,
  }).map((date) => ({
    date,
    ...(countsByDate.get(date) ??
      createEmptyApplicationRegistrationAnalyticsCounts()),
  }));
};
