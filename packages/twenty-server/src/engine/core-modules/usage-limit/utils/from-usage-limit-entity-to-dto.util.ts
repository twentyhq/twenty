import { type UsageLimitDTO } from 'src/engine/core-modules/usage-limit/dtos/usage-limit.dto';
import { type UsageLimitEntity } from 'src/engine/core-modules/usage-limit/usage-limit.entity';
import { normalizeSpenderId } from 'src/engine/core-modules/usage-limit/utils/normalize-spender-id.util';

export const fromUsageLimitEntityToDto = (
  usageLimit: UsageLimitEntity,
): UsageLimitDTO => ({
  id: usageLimit.id,
  resourceType: usageLimit.resourceType,
  operationType: usageLimit.operationType,
  spenderType: usageLimit.spenderType,
  spenderId: normalizeSpenderId(usageLimit.spenderId),
  limitKind: usageLimit.limitKind,
  periodCount: usageLimit.periodCount,
  periodUnit: usageLimit.periodUnit,
  meter: usageLimit.meter,
  limitValue: usageLimit.limitValue,
  burstValue: usageLimit.burstValue,
  createdAt: usageLimit.createdAt,
  updatedAt: usageLimit.updatedAt,
});
