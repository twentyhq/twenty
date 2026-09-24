import { type UsageLimitDefault } from 'src/engine/core-modules/usage-limit/types/usage-limit-default.type';
import { type UsageLimitScope } from 'src/engine/core-modules/usage-limit/utils/build-usage-limit-scope.util';

export const doesUsageLimitRowSuppressDefault = ({
  scope,
  usageLimitDefault,
}: {
  scope: UsageLimitScope;
  usageLimitDefault: Pick<
    UsageLimitDefault,
    | 'isOverridable'
    | 'limitKind'
    | 'resourceType'
    | 'operationType'
    | 'spenderType'
    | 'meter'
  >;
}): boolean =>
  usageLimitDefault.isOverridable &&
  scope.spenderId === '' &&
  scope.limitKind === usageLimitDefault.limitKind &&
  scope.resourceType === usageLimitDefault.resourceType &&
  scope.operationType === usageLimitDefault.operationType &&
  scope.spenderType === usageLimitDefault.spenderType &&
  scope.meter === usageLimitDefault.meter;
