import { APPLICATION_REGISTRATION_ANALYTICS_BREAKDOWN_LIMIT } from 'src/engine/core-modules/application/application-registration-analytics/constants/application-registration-analytics-breakdown-limit.constant';
import { type ApplicationRegistrationAnalyticsBreakdownItemDTO } from 'src/engine/core-modules/application/application-registration-analytics/dtos/application-registration-analytics.dto';
import {
  type ApplicationRegistrationMetricRowWithWorkspaceCount,
  filterApplicationRegistrationMetricRowsByWorkspaceCount,
} from 'src/engine/core-modules/application/application-registration-analytics/utils/filter-application-registration-metric-rows-by-workspace-count.util';

export type ApplicationRegistrationMetricDailyBreakdownRow =
  ApplicationRegistrationMetricRowWithWorkspaceCount & {
    key: string;
    date: string;
    value: string | number;
  };

// Sparse (key, day) cells are dropped before summing so a key seen in one workspace never surfaces
export const buildApplicationRegistrationAnalyticsBreakdown = ({
  rows,
  convertValue = (value) => value,
}: {
  rows: ApplicationRegistrationMetricDailyBreakdownRow[];
  convertValue?: (value: number) => number;
}): ApplicationRegistrationAnalyticsBreakdownItemDTO[] => {
  const valueByKey = new Map<string, number>();

  for (const row of filterApplicationRegistrationMetricRowsByWorkspaceCount({
    rows,
  })) {
    valueByKey.set(row.key, (valueByKey.get(row.key) ?? 0) + Number(row.value));
  }

  return [...valueByKey.entries()]
    .map(([key, value]) => ({ key, value: convertValue(value) }))
    .sort((left, right) => right.value - left.value)
    .slice(0, APPLICATION_REGISTRATION_ANALYTICS_BREAKDOWN_LIMIT);
};
