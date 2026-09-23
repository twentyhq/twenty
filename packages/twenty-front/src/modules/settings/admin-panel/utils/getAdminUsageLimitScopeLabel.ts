import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { ADMIN_USAGE_LIMIT_PERIOD_UNIT_LABELS } from '@/settings/admin-panel/constants/UsageLimitPeriodUnitLabels';
import { USAGE_LIMIT_RESOURCE_TYPE_LABELS } from '@/settings/billing/constants/UsageLimitResourceTypeLabels';
import { USAGE_LIMIT_SPENDER_TYPE_LABELS } from '@/settings/billing/constants/UsageLimitSpenderTypeLabels';
import { isKeyOfRecord } from '@/settings/billing/utils/isKeyOfRecord';
import { type AdminUsageLimitRow } from '@/settings/admin-panel/types/AdminUsageLimitRow';
import { getUsageOperationTypeLabel } from '@/settings/usage/utils/getUsageOperationTypeLabel';

export const getAdminUsageLimitResourceLabel = (
  row: AdminUsageLimitRow,
): string =>
  isKeyOfRecord(USAGE_LIMIT_RESOURCE_TYPE_LABELS, row.resourceType)
    ? t(USAGE_LIMIT_RESOURCE_TYPE_LABELS[row.resourceType])
    : row.resourceType;

export const getAdminUsageLimitOperationLabel = (
  row: AdminUsageLimitRow,
): string => {
  const operationLabel = getUsageOperationTypeLabel(row.operationType);

  return isDefined(operationLabel) ? t(operationLabel) : row.operationType;
};

export const getAdminUsageLimitSpenderLabel = (
  row: AdminUsageLimitRow,
): string =>
  isKeyOfRecord(USAGE_LIMIT_SPENDER_TYPE_LABELS, row.spenderType)
    ? t(USAGE_LIMIT_SPENDER_TYPE_LABELS[row.spenderType])
    : row.spenderType;

export const getAdminUsageLimitPeriodLabel = (
  row: AdminUsageLimitRow,
): string => {
  const periodUnitLabel = ADMIN_USAGE_LIMIT_PERIOD_UNIT_LABELS[row.periodUnit];
  const unitText = isDefined(periodUnitLabel)
    ? t(periodUnitLabel)
    : row.periodUnit;

  if (row.periodUnit === 'lifetime') {
    return unitText;
  }

  return row.periodCount === 1 ? unitText : `${row.periodCount} ${unitText}`;
};

export const getAdminUsageLimitScopeLabel = (row: AdminUsageLimitRow): string =>
  `${getAdminUsageLimitResourceLabel(row)} · ${getAdminUsageLimitOperationLabel(row)} · ${getAdminUsageLimitSpenderLabel(row)}`;
