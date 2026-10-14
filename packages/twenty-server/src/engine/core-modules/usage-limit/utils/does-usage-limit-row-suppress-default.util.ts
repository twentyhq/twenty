import { type UsageLimitScope } from 'src/engine/core-modules/usage-limit/utils/build-usage-limit-scope.util';
import {
  getUsageLimitDefaultOperationTypes,
  type UsageLimitDefaultOperations,
} from 'src/engine/core-modules/usage-limit/utils/get-usage-limit-default-operation-types.util';

type SuppressibleScope = Omit<UsageLimitScope, 'periodCount'>;

export const doesUsageLimitRowSuppressDefault = ({
  scope,
  usageLimitDefault,
}: {
  scope: SuppressibleScope;
  usageLimitDefault: Omit<SuppressibleScope, 'operationType'> &
    UsageLimitDefaultOperations & { isOverridable: boolean };
}): boolean => {
  const operationTypes = getUsageLimitDefaultOperationTypes(usageLimitDefault);

  return (
    usageLimitDefault.isOverridable &&
    scope.resourceType === usageLimitDefault.resourceType &&
    operationTypes.length === 1 &&
    scope.operationType === operationTypes[0] &&
    scope.spenderType === usageLimitDefault.spenderType &&
    scope.spenderId === usageLimitDefault.spenderId &&
    scope.limitKind === usageLimitDefault.limitKind &&
    scope.periodUnit === usageLimitDefault.periodUnit &&
    scope.unit === usageLimitDefault.unit
  );
};
