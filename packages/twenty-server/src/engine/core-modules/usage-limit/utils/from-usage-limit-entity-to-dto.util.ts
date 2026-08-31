import { type UsageLimitDTO } from 'src/engine/core-modules/usage-limit/dtos/usage-limit.dto';
import { type UsageLimitEntity } from 'src/engine/core-modules/usage-limit/usage-limit.entity';

export const fromUsageLimitEntityToDto = (
  usageLimit: UsageLimitEntity,
): UsageLimitDTO => ({
  id: usageLimit.id,
  resourceType: usageLimit.resourceType,
  operationType: usageLimit.operationType,
  spenderType: usageLimit.spenderType,
  spenderId: usageLimit.spenderId,
  limitKind: usageLimit.limitKind,
  periodCount: usageLimit.periodCount,
  windowSeconds:
    usageLimit.periodUnit === 'second' ? usageLimit.periodCount : 0,
  periodUnit: usageLimit.periodUnit,
  meter: usageLimit.meter,
  limitValueType: usageLimit.limitValueType,
  limitValue: usageLimit.limitValue,
  burstValue: usageLimit.burstValue,
  createdAt: usageLimit.createdAt,
  updatedAt: usageLimit.updatedAt,
});
