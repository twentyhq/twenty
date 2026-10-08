import { buildCursorKeysetCondition } from 'src/engine/api/utils/build-cursor-keyset-condition.utils';
import { type OrderByLeaf } from 'src/engine/api/utils/resolve-order-by-leaves.utils';

// Any nullable column can hold NULL whatever its type (empty text is stored as NULL).
// Composite sub-columns and joined columns have no nullability metadata; a needless IS NULL branch matches nothing
const checkIfLeafCanHoldNullValue = (leaf: OrderByLeaf): boolean =>
  leaf.kind === 'scalar' ? leaf.fieldMetadata.isNullable !== false : true;

type BuildCursorLeafWhereConditionParams = {
  leaf: OrderByLeaf;
  cursorValue: unknown;
  isForwardPagination: boolean;
  isEqualityCondition: boolean;
};

// The path's filter nesting resolves against the column the ordering uses (relations via its LEFT JOIN)
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
