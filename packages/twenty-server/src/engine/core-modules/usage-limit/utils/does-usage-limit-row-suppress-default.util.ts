import { type UsageLimitScope } from 'src/engine/core-modules/usage-limit/utils/build-usage-limit-scope.util';
import { getUsageLimitDefaultOverrideOperationType } from 'src/engine/core-modules/usage-limit/utils/get-usage-limit-default-override-operation-type.util';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';

type SuppressibleScope = Omit<UsageLimitScope, 'periodCount'>;

export const doesUsageLimitRowSuppressDefault = ({
  scope,
  usageLimitDefault,
}: {
  scope: SuppressibleScope;
  usageLimitDefault: Omit<SuppressibleScope, 'operationType'> & {
    operationTypes: UsageOperationType[];
    isOverridable: boolean;
  };
}): boolean =>
  usageLimitDefault.isOverridable &&
  scope.resourceType === usageLimitDefault.resourceType &&
  scope.operationType ===
    getUsageLimitDefaultOverrideOperationType(
      usageLimitDefault.operationTypes,
    ) &&
  scope.spenderType === usageLimitDefault.spenderType &&
  scope.spenderId === usageLimitDefault.spenderId &&
  scope.limitKind === usageLimitDefault.limitKind &&
  scope.periodUnit === usageLimitDefault.periodUnit &&
  scope.unit === usageLimitDefault.unit;
