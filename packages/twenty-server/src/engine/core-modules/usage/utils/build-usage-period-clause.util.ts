import { type UsagePeriodAnchor } from 'src/engine/core-modules/usage/types/usage-period-anchor.type';

const BILLING_PERIOD_STAMP_SLACK = 'INTERVAL 1 DAY';

export const buildUsagePeriodClause = (
  periodAnchor: UsagePeriodAnchor,
  parameterSuffix = '',
): string => {
  const periodStart = `{periodStart${parameterSuffix}:DateTime64(3)}`;
  const periodEnd = `{periodEnd${parameterSuffix}:DateTime64(3)}`;

  return periodAnchor === 'billing'
    ? `AND periodStart = ${periodStart}
       AND timestamp >= ${periodStart} - ${BILLING_PERIOD_STAMP_SLACK}
       AND timestamp < ${periodEnd} + ${BILLING_PERIOD_STAMP_SLACK}`
    : `AND toStartOfDay(timestamp, 'UTC') >= ${periodStart}
       AND toStartOfDay(timestamp, 'UTC') < ${periodEnd}`;
};
