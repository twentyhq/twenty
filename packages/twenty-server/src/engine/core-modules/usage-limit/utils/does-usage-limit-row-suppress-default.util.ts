import { type UsageLimitDefault } from 'src/engine/core-modules/usage-limit/types/usage-limit-default.type';
import { type UsageLimitScope } from 'src/engine/core-modules/usage-limit/utils/build-usage-limit-scope.util';

// Mirrors the filters in build-speed-buckets.util.ts and build-stock-counters.util.ts.
// Both drop a default only when it is overridable and a row left open to every
// spender of its type covers it, so a row facing a non-overridable default
// suppresses nothing and only tightens alongside it.
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
  // findLimitsForSpender lets a row's ALL stand in for every operation, but the
  // kind rules keep ALL out of speed and stock, the only kinds declaring a
  // default. A kind that both allows ALL and declares one has to widen this.
  scope.operationType === usageLimitDefault.operationType &&
  scope.spenderType === usageLimitDefault.spenderType &&
  scope.meter === usageLimitDefault.meter;
