import { t } from '@lingui/core/macro';

import { type AdminUsageLimitRow } from '@/settings/admin-panel/types/AdminUsageLimitRow';
import { USAGE_LIMIT_SPENDER_TYPE_LABELS } from '@/settings/billing/constants/UsageLimitSpenderTypeLabels';
import { isKeyOfRecord } from '@/settings/billing/utils/isKeyOfRecord';

export const getAdminUsageLimitSpenderLabel = (
  row: AdminUsageLimitRow,
): string =>
  isKeyOfRecord(USAGE_LIMIT_SPENDER_TYPE_LABELS, row.spenderType)
    ? t(USAGE_LIMIT_SPENDER_TYPE_LABELS[row.spenderType])
    : row.spenderType;
