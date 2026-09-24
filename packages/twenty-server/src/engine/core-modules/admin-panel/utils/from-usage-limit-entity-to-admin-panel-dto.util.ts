import { isNonEmptyString } from 'twenty-shared/utils';

import { type AdminPanelUsageLimitDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-panel-workspace-usage-limits.dto';
import { type UsageLimitEntity } from 'src/engine/core-modules/usage-limit/usage-limit.entity';

export const fromUsageLimitEntityToAdminPanelDto = (
  usageLimit: UsageLimitEntity,
): AdminPanelUsageLimitDTO => ({
  id: usageLimit.id,
  resourceType: usageLimit.resourceType,
  operationType: usageLimit.operationType,
  spenderType: usageLimit.spenderType,
  spenderId: isNonEmptyString(usageLimit.spenderId)
    ? usageLimit.spenderId
    : null,
  limitKind: usageLimit.limitKind,
  periodCount: usageLimit.periodCount,
  periodUnit: usageLimit.periodUnit,
  meter: usageLimit.meter,
  limitValue: usageLimit.limitValue,
  burstValue: usageLimit.burstValue,
  createdAt: usageLimit.createdAt,
  updatedAt: usageLimit.updatedAt,
});
