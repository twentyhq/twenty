import { type UsageLimitEntity } from 'src/engine/core-modules/usage-limit/usage-limit.entity';

export type UsageLimitScope = Pick<
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

// Takes a create input or a stored row: both name a scope, and only the input
// leaves spenderId open.
type UsageLimitScopeSource = Omit<UsageLimitScope, 'spenderId'> & {
  spenderId?: string | null;
};

export const buildUsageLimitScope = (
  source: UsageLimitScopeSource,
): UsageLimitScope => ({
  resourceType: source.resourceType,
  operationType: source.operationType,
  spenderType: source.spenderType,
  spenderId: source.spenderId ?? '',
  limitKind: source.limitKind,
  periodCount: source.periodCount,
  periodUnit: source.periodUnit,
  meter: source.meter,
});
