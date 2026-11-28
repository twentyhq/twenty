import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type AdminUsageLimitRow } from '@/settings/admin-panel/types/AdminUsageLimitRow';
import { USAGE_LIMIT_PERIOD_UNIT_LABELS } from '@/settings/billing/constants/UsageLimitPeriodUnitLabels';
import { getUsageLimitLabel } from '@/settings/billing/utils/getUsageLimitLabel';
import { formatRoundedDuration } from '~/utils/format/formatRoundedDuration';

export const getAdminUsageLimitPeriodLabel = (
  row: Pick<AdminUsageLimitRow, 'periodCount' | 'periodUnit'>,
): string => {
  if (row.periodUnit === 'second') {
    return formatRoundedDuration(row.periodCount * 1000);
  }

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
