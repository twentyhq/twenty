import { type UsageLimitScope } from 'src/engine/core-modules/usage-limit/utils/build-usage-limit-scope.util';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';

type SuppressibleScope = Omit<UsageLimitScope, 'periodCount'>;

export const doesUsageLimitRowSuppressDefault = ({
  scope,
  usageLimitDefault,
}: {
  scope: SuppressibleScope;
  usageLimitDefault: Omit<SuppressibleScope, 'operationType'> & {
    operationType: UsageOperationType | UsageOperationType[];
    isOverridable: boolean;
  };
}): boolean =>
  usageLimitDefault.isOverridable &&
  scope.resourceType === usageLimitDefault.resourceType &&
  scope.operationType === usageLimitDefault.operationType &&
  scope.spenderType === usageLimitDefault.spenderType &&
  scope.spenderId === usageLimitDefault.spenderId &&
  scope.limitKind === usageLimitDefault.limitKind &&
  scope.periodUnit === usageLimitDefault.periodUnit &&
  scope.unit === usageLimitDefault.unit;
