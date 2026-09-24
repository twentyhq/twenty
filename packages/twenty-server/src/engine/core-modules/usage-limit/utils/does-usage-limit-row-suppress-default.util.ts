import { type UsageLimitScope } from 'src/engine/core-modules/usage-limit/utils/build-usage-limit-scope.util';

// The period is left out because the counter builders leave it out too.
type SuppressibleScope = Omit<UsageLimitScope, 'periodCount' | 'periodUnit'>;

export const doesUsageLimitRowSuppressDefault = ({
  scope,
  usageLimitDefault,
}: {
  scope: UsageLimitScope;
  usageLimitDefault: SuppressibleScope & { isOverridable: boolean };
}): boolean =>
  usageLimitDefault.isOverridable &&
  scope.resourceType === usageLimitDefault.resourceType &&
  scope.operationType === usageLimitDefault.operationType &&
  scope.spenderType === usageLimitDefault.spenderType &&
  scope.spenderId === usageLimitDefault.spenderId &&
  scope.limitKind === usageLimitDefault.limitKind &&
  scope.meter === usageLimitDefault.meter;
