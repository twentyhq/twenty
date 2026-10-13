import { type ApplicationRegistrationMetricSumRow } from 'src/engine/core-modules/application/application-registration-analytics/types/application-registration-metric-sum-row.type';

export type ApplicationRegistrationMetricDailySumRow =
  ApplicationRegistrationMetricSumRow & {
    date: string;
  };
