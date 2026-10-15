import { APPLICATION_REGISTRATION_ANALYTICS_BREAKDOWN_LIMIT } from 'src/engine/core-modules/application/application-registration-analytics/constants/application-registration-analytics-breakdown-limit.constant';
import { type ApplicationRegistrationAnalyticsBreakdownItemDTO } from 'src/engine/core-modules/application/application-registration-analytics/dtos/application-registration-analytics.dto';
import { type ApplicationRegistrationAnalyticsBreakdownGroupBy } from 'src/engine/core-modules/application/application-registration-analytics/types/application-registration-analytics-breakdown-group-by.type';
import { type ApplicationRegistrationMetricCellRow } from 'src/engine/core-modules/application/application-registration-analytics/types/application-registration-metric-cell-row.type';
import { type ApplicationRegistrationMetricName } from 'src/engine/core-modules/application/application-registration-analytics/types/application-registration-metric-name.type';

export const buildApplicationRegistrationAnalyticsBreakdown = ({
  rows,
  metrics,
  groupBy,
  convertValue = (value) => value,
}: {
  rows: Pick<
    ApplicationRegistrationMetricCellRow,
    'metric' | 'dimension' | 'context' | 'value'
  >[];
  metrics: ApplicationRegistrationMetricName[];
  groupBy: ApplicationRegistrationAnalyticsBreakdownGroupBy;
  convertValue?: (value: number) => number;
}): ApplicationRegistrationAnalyticsBreakdownItemDTO[] => {
  const valueByKey = new Map<string, number>();

  for (const row of rows) {
    const key = row[groupBy];

    if (!metrics.some((metric) => metric === row.metric) || key === '') {
      continue;
    }

    valueByKey.set(key, (valueByKey.get(key) ?? 0) + Number(row.value));
  }

  return [...valueByKey.entries()]
    .map(([key, value]) => ({ key, value: convertValue(value) }))
    .sort((left, right) => right.value - left.value)
    .slice(0, APPLICATION_REGISTRATION_ANALYTICS_BREAKDOWN_LIMIT);
};
