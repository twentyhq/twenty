import { type UsageLimitScope } from 'src/engine/core-modules/usage-limit/utils/build-usage-limit-scope.util';

type SuppressibleScope = Omit<UsageLimitScope, 'periodCount' | 'periodUnit'>;

export const doesUsageLimitRowSuppressDefault = ({
  scope,
  usageLimitDefault,
}: {
  scope: SuppressibleScope;
  usageLimitDefault: SuppressibleScope & { isOverridable: boolean };
}): boolean =>
  usageLimitDefault.isOverridable &&
  scope.resourceType === usageLimitDefault.resourceType &&
  scope.operationType === usageLimitDefault.operationType &&
  scope.spenderType === usageLimitDefault.spenderType &&
  scope.spenderId === usageLimitDefault.spenderId &&
  scope.limitKind === usageLimitDefault.limitKind &&
  scope.meter === usageLimitDefault.meter;
