import { type UsagePeriodAnchor } from 'src/engine/core-modules/usage/types/usage-period-anchor.type';

const BILLING_PERIOD_STAMP_SLACK = 'INTERVAL 1 DAY';

export const buildUsagePeriodClause = (
  periodAnchor: UsagePeriodAnchor,
): string =>
  periodAnchor === 'billing'
    ? `AND periodStart = {periodStart:DateTime64(3)}
       AND timestamp >= {periodStart:DateTime64(3)} - ${BILLING_PERIOD_STAMP_SLACK}
       AND timestamp < {periodEnd:DateTime64(3)} + ${BILLING_PERIOD_STAMP_SLACK}`
    : `AND toStartOfDay(timestamp, 'UTC') >= {periodStart:DateTime64(3)}
       AND toStartOfDay(timestamp, 'UTC') < {periodEnd:DateTime64(3)}`;
