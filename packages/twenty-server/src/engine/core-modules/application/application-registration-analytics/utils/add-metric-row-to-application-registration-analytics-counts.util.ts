import { APPLICATION_REGISTRATION_COUNT_METRIC_FIELDS } from 'src/engine/core-modules/application/application-registration-analytics/constants/application-registration-count-metric-fields.constant';
import { type ApplicationRegistrationAnalyticsCounts } from 'src/engine/core-modules/application/application-registration-analytics/types/application-registration-analytics-counts.type';
import { type ApplicationRegistrationMetricSumRow } from 'src/engine/core-modules/application/application-registration-analytics/types/application-registration-metric-sum-row.type';
import { isApplicationRegistrationCountMetric } from 'src/engine/core-modules/application/application-registration-analytics/utils/is-application-registration-count-metric.util';
import { toDisplayCredits } from 'src/engine/core-modules/usage/utils/to-display-credits.util';

// Mutates in place: callers accumulate many rows into one bucket
export const addMetricRowToApplicationRegistrationAnalyticsCounts = ({
  counts,
  row,
}: {
  counts: ApplicationRegistrationAnalyticsCounts;
  row: ApplicationRegistrationMetricSumRow;
}): ApplicationRegistrationAnalyticsCounts => {
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
