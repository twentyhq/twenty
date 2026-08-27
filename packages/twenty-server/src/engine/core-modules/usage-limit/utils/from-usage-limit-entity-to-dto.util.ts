import { type UsageLimitDTO } from 'src/engine/core-modules/usage-limit/dtos/usage-limit.dto';
import { type UsageLimitEntity } from 'src/engine/core-modules/usage-limit/usage-limit.entity';

export const fromUsageLimitEntityToDto = (
  usageLimit: UsageLimitEntity,
): UsageLimitDTO => ({
  id: usageLimit.id,
  resourceType: usageLimit.resourceType,
  operationType:
    usageLimit.operationType === '' ? null : usageLimit.operationType,
  spenderType: usageLimit.spenderType,
  spenderId: usageLimit.spenderId,
  limitKind: usageLimit.limitKind,
  windowSeconds: usageLimit.windowSeconds,
  limitValueType: usageLimit.limitValueType,
  limitValue: usageLimit.limitValue,
  burstValue: usageLimit.burstValue,
  createdAt: usageLimit.createdAt,
  updatedAt: usageLimit.updatedAt,
});
