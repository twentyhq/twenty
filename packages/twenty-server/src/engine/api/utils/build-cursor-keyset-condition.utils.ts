import {
  type FieldMetadataType,
  type OrderByDirection,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { findPostgresDefaultNullEquivalentValue } from 'src/engine/api/common/common-args-processors/data-arg-processor/utils/find-postgres-default-null-equivalent-value.util';
import { getEffectiveScanOrder } from 'src/engine/api/utils/get-effective-scan-order.utils';

// Columns of these types are created NOT NULL with a Postgres default (e.g. ''
// for TEXT), so they never hold SQL NULL and need no NULL-continuation branch
export const checkIfColumnHasNullEquivalentDefault = (
  fieldType: FieldMetadataType,
  compositeSubFieldKey?: string,
): boolean =>
  isDefined(
    findPostgresDefaultNullEquivalentValue(
      'NULL',
      fieldType,
      compositeSubFieldKey,
    ),
  );

type BuildCursorKeysetConditionParams = {
  cursorValue: unknown;
  orderByDirection: OrderByDirection;
  isForwardPagination: boolean;
  isEqualityCondition: boolean;
  canFieldHoldNullValue: boolean;
  // Wraps a leaf filter (e.g. { gt: value }) into the field's filter path
  buildLeafCondition: (
    leafFilter: Record<string, unknown>,
  ) => Record<string, unknown>;
  // Overridable for fields whose NULL block is better matched through another
  // column (e.g. a relation's join column)
  buildNullCheckCondition?: (isNull: boolean) => Record<string, unknown>;
};

// The single home of the null-aware keyset algebra shared by scalar, composite
// and relation orderBy keys. Returns null when no row can sort strictly after
// the cursor on this key alone (cursor inside the trailing NULL block): the
// caller must then drop the or-branch and rely on the tie-breaking keys.
// Equality conditions always exist, which the overloads make visible to callers.
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
  buildNullCheckCondition = (isNull) =>
    buildLeafCondition({ is: isNull ? 'NULL' : 'NOT_NULL' }),
}: BuildCursorKeysetConditionParams): Record<string, unknown> | null {
  if (isEqualityCondition) {
    return cursorValue === null
      ? buildNullCheckCondition(true)
      : buildLeafCondition({ eq: cursorValue });
  }

  const { isAscending, areNullsScannedLast } = getEffectiveScanOrder(
    orderByDirection,
    isForwardPagination,
  );

  if (cursorValue === null) {
    // Inside the leading NULL block only the tie-breaking keys can advance the
    // scan; inside the trailing one nothing sorts after on this key at all
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
