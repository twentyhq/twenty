/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

const TRIAL_END_TO_PERIOD_START_TOLERANCE_IN_SECONDS = 60;

type SubscriptionWithLatestInvoiceLines = {
  trial_end: number | null;
  latest_invoice: { lines: { data: { period: { start: number } }[] } } | null;
};

export const isLatestInvoiceForFirstPeriodAfterTrial = ({
  trial_end: trialEnd,
  latest_invoice: latestInvoice,
}: SubscriptionWithLatestInvoiceLines): boolean =>
  isDefined(trialEnd) &&
  isDefined(latestInvoice) &&
  latestInvoice.lines.data.some(
    (line) =>
      Math.abs(line.period.start - trialEnd) <=
      TRIAL_END_TO_PERIOD_START_TOLERANCE_IN_SECONDS,
  );
