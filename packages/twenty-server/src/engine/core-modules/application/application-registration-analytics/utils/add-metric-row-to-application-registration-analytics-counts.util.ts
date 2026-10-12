import {
  APPLICATION_REGISTRATION_COUNT_METRIC_FIELDS,
  isApplicationRegistrationCountMetric,
} from 'src/engine/core-modules/application/application-registration-analytics/constants/application-registration-count-metric-fields.constant';
import { type ApplicationRegistrationAnalyticsCounts } from 'src/engine/core-modules/application/application-registration-analytics/types/application-registration-analytics-counts.type';
import { toDisplayCredits } from 'src/engine/core-modules/usage/utils/to-display-credits.util';

export type ApplicationRegistrationMetricSumRow = {
  metric: string;
  value: string | number;
};

// Mutates in place: callers accumulate many rows into one bucket
export const addMetricRowToApplicationRegistrationAnalyticsCounts = (
  counts: ApplicationRegistrationAnalyticsCounts,
  row: ApplicationRegistrationMetricSumRow,
): ApplicationRegistrationAnalyticsCounts => {
  const value = Number(row.value);

  if (row.metric === 'charge.credits_micro') {
    counts.creditsCharged += toDisplayCredits(value);

    return counts;
  }

  if (isApplicationRegistrationCountMetric(row.metric)) {
    counts[APPLICATION_REGISTRATION_COUNT_METRIC_FIELDS[row.metric]] += value;
  }

  return counts;
};
