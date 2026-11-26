import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type AdminUsageLimitRow } from '@/settings/admin-panel/types/AdminUsageLimitRow';
import { USAGE_LIMIT_PERIOD_UNIT_LABELS } from '@/settings/billing/constants/UsageLimitPeriodUnitLabels';
import { getUsageLimitLabel } from '@/settings/billing/utils/getUsageLimitLabel';

const SECONDS_PER_DAY = 24 * 60 * 60;

// Speed limits are stored in seconds, so a whole-day window reads as days instead
const toReadablePeriod = (
  row: Pick<AdminUsageLimitRow, 'periodCount' | 'periodUnit'>,
): Pick<AdminUsageLimitRow, 'periodCount' | 'periodUnit'> =>
  row.periodUnit === 'second' && row.periodCount % SECONDS_PER_DAY === 0
    ? { periodCount: row.periodCount / SECONDS_PER_DAY, periodUnit: 'day' }
    : row;

export const getAdminUsageLimitPeriodLabel = (
  usageLimit: Pick<AdminUsageLimitRow, 'periodCount' | 'periodUnit'>,
): string => {
  const row = toReadablePeriod(usageLimit);
  const periodUnitLabel = getUsageLimitLabel(
    USAGE_LIMIT_PERIOD_UNIT_LABELS,
    row.periodUnit,
  );
  const unitText = isDefined(periodUnitLabel)
    ? t(periodUnitLabel)
    : row.periodUnit;

  if (row.periodUnit === 'lifetime') {
    return unitText;
  }

  return row.periodCount === 1 ? unitText : `${row.periodCount} ${unitText}`;
};
