import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type AdminUsageLimitRow } from '@/settings/admin-panel/types/AdminUsageLimitRow';
import { getUsageOperationTypeLabel } from '@/settings/usage/utils/getUsageOperationTypeLabel';

export const getAdminUsageLimitOperationLabel = (
  row: AdminUsageLimitRow,
): string => {
  const operationLabel = getUsageOperationTypeLabel(row.operationType);

  return isDefined(operationLabel) ? t(operationLabel) : row.operationType;
};
