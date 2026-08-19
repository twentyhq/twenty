import {
  buildCursorKeysetCondition,
  checkIfColumnHasNullEquivalentDefault,
} from 'src/engine/api/utils/build-cursor-keyset-condition.utils';
import { type OrderByLeaf } from 'src/engine/api/utils/resolve-order-by-leaves.utils';

// Composite sub-columns are NOT NULL whenever their type defines a Postgres
// null-equivalent default; scalar columns additionally honor field nullability.
const checkIfLeafCanHoldNullValue = (leaf: OrderByLeaf): boolean => {
  switch (leaf.kind) {
    case 'composite':
      return !checkIfColumnHasNullEquivalentDefault(
        leaf.fieldMetadata.type,
        leaf.compositeProperty.name,
      );
    case 'scalar':
      return (
        leaf.fieldMetadata.isNullable !== false &&
        !checkIfColumnHasNullEquivalentDefault(leaf.fieldMetadata.type)
      );
    // A LEFT JOIN can always produce NULLs, whatever the target column's type
    case 'relation':
      return true;
  }
};

type BuildCursorLeafWhereConditionParams = {
  leaf: OrderByLeaf;
  cursorValue: unknown;
  isForwardPagination: boolean;
  isEqualityCondition: boolean;
};

// The leaf's path is also its filter nesting: { name: { firstName: { gt: v } } }
// resolves against the same column the ordering uses.
export function buildCursorLeafWhereCondition(
  params: BuildCursorLeafWhereConditionParams & { isEqualityCondition: true },
): Record<string, unknown>;
export function buildCursorLeafWhereCondition(
  params: BuildCursorLeafWhereConditionParams,
): Record<string, unknown> | null;
export function buildCursorLeafWhereCondition({
  leaf,
  cursorValue,
  isForwardPagination,
  isEqualityCondition,
}: BuildCursorLeafWhereConditionParams): Record<string, unknown> | null {
  return buildCursorKeysetCondition({
    cursorValue,
    orderByDirection: leaf.direction,
    isForwardPagination,
    isEqualityCondition,
    canFieldHoldNullValue: checkIfLeafCanHoldNullValue(leaf),
    buildLeafCondition: (leafFilter) =>
      leaf.path.reduceRight<Record<string, unknown>>(
        (nested, key) => ({ [key]: nested }),
        leafFilter,
      ),
  });
}
