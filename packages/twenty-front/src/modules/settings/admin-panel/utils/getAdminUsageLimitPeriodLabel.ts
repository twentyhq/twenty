import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type AdminUsageLimitRow } from '@/settings/admin-panel/types/AdminUsageLimitRow';
import { USAGE_LIMIT_PERIOD_UNIT_LABELS } from '@/settings/billing/constants/UsageLimitPeriodUnitLabels';
import { getUsageLimitLabel } from '@/settings/billing/utils/getUsageLimitLabel';

export const getAdminUsageLimitPeriodLabel = (
  row: AdminUsageLimitRow,
): string => {
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
