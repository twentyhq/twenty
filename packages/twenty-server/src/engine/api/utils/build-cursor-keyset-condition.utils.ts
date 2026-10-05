import { type OrderByDirection } from 'twenty-shared/types';

import { getEffectiveScanOrder } from 'src/engine/api/utils/get-effective-scan-order.utils';

type BuildCursorKeysetConditionParams = {
  cursorValue: unknown;
  orderByDirection: OrderByDirection;
  isForwardPagination: boolean;
  isEqualityCondition: boolean;
  canFieldHoldNullValue: boolean;
  buildLeafCondition: (
    leafFilter: Record<string, unknown>,
  ) => Record<string, unknown>;
  buildNullCheckCondition?: (isNull: boolean) => Record<string, unknown>;
};

// Null when the cursor sits in the trailing NULL block: callers drop the or-branch and rely on tie-breakers
export function buildCursorKeysetCondition(
  params: BuildCursorKeysetConditionParams & { isEqualityCondition: true },
): Record<string, unknown>;
export function buildCursorKeysetCondition(
  params: BuildCursorKeysetConditionParams,
): Record<string, unknown> | null;
export function buildCursorKeysetCondition({
  cursorValue,
  orderByDirection,
  isForwardPagination,
  isEqualityCondition,
  canFieldHoldNullValue,
  buildLeafCondition,
  // Strict operators, not 'is' or 'eq': their empty-value widening does not mirror the SQL scan order
  buildNullCheckCondition = (isNull) =>
    buildLeafCondition({ isStrictly: isNull ? 'NULL' : 'NOT_NULL' }),
}: BuildCursorKeysetConditionParams): Record<string, unknown> | null {
  if (isEqualityCondition) {
    return cursorValue === null
      ? buildNullCheckCondition(true)
      : buildLeafCondition({ eqStrict: cursorValue });
  }

  const { isAscending, areNullsScannedLast } = getEffectiveScanOrder(
    orderByDirection,
    isForwardPagination,
  );

  if (cursorValue === null) {
    return areNullsScannedLast ? null : buildNullCheckCondition(false);
  }

  const mainCondition = buildLeafCondition({
    [isAscending ? 'gt' : 'lt']: cursorValue,
  });

  if (areNullsScannedLast && canFieldHoldNullValue) {
    return { or: [mainCondition, buildNullCheckCondition(true)] };
  }

  return mainCondition;
}
