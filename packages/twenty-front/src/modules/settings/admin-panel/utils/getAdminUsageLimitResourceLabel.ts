import { t } from '@lingui/core/macro';

import { type AdminUsageLimitRow } from '@/settings/admin-panel/types/AdminUsageLimitRow';
import { USAGE_LIMIT_RESOURCE_TYPE_LABELS } from '@/settings/billing/constants/UsageLimitResourceTypeLabels';
import { isKeyOfRecord } from '@/settings/billing/utils/isKeyOfRecord';

export const getAdminUsageLimitResourceLabel = (
  row: AdminUsageLimitRow,
): string =>
  isKeyOfRecord(USAGE_LIMIT_RESOURCE_TYPE_LABELS, row.resourceType)
    ? t(USAGE_LIMIT_RESOURCE_TYPE_LABELS[row.resourceType])
    : row.resourceType;
