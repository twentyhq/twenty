import { type CreateUsageLimitInput } from 'src/engine/core-modules/usage-limit/dtos/create-usage-limit.input';
import { type UsageLimitEntity } from 'src/engine/core-modules/usage-limit/usage-limit.entity';

type UsageLimitScope = Pick<
  UsageLimitEntity,
  | 'resourceType'
  | 'operationType'
  | 'spenderType'
  | 'spenderId'
  | 'limitKind'
  | 'periodCount'
  | 'periodUnit'
  | 'meter'
>;

export const buildUsageLimitScope = (
  input: CreateUsageLimitInput,
): UsageLimitScope => ({
  resourceType: input.resourceType,
  operationType: input.operationType,
  spenderType: input.spenderType,
  spenderId: input.spenderId ?? '',
  limitKind: input.limitKind,
  periodCount: input.periodCount,
  periodUnit: input.periodUnit,
  meter: input.meter,
});
