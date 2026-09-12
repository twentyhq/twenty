import { isDefined } from 'twenty-shared/utils';

import { shouldUseCaseInsensitiveOrder } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-order/utils/build-order-by-column-expression.util';
import { buildCursorKeysetCondition } from 'src/engine/api/utils/build-cursor-keyset-condition.utils';
import { computeOrderByLeafColumnType } from 'src/engine/api/utils/compute-order-by-leaf-column.util';
import { type OrderByLeaf } from 'src/engine/api/utils/resolve-order-by-leaves.utils';

// SQL NULL can sit in any nullable column whatever its type: write-side
// normalization stores empty TEXT-like values as NULL, and rows written
// without the field hold NULL too, so they all sort into the NULL block.
// Composite sub-columns and joined columns carry no own nullability metadata
// and are treated as nullable; a needless IS NULL branch matches nothing.
const checkIfLeafCanHoldNullValue = (leaf: OrderByLeaf): boolean =>
  leaf.kind === 'scalar' ? leaf.fieldMetadata.isNullable !== false : true;

// Read from the leaf's own column type, the way the SQL order parser decides
// whether to wrap the column in LOWER(), so the keyset predicate and the scan
// order cannot disagree about the ordering relation.
const checkIfLeafIsOrderedCaseInsensitively = (leaf: OrderByLeaf): boolean => {
  const columnType = computeOrderByLeafColumnType(leaf);

  return isDefined(columnType) && shouldUseCaseInsensitiveOrder(columnType);
};

type BuildCursorLeafWhereConditionParams = {
  leaf: OrderByLeaf;
  cursorValue: unknown;
  isForwardPagination: boolean;
  isEqualityCondition: boolean;
};

// The leaf's path is also its filter nesting: { company: { name: { gt: v } } }
// resolves against the same column the ordering uses (relation paths through
// the LEFT JOIN of the ordering, composite paths through the flat sub-column).
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
    isCaseInsensitiveOrder: checkIfLeafIsOrderedCaseInsensitively(leaf),
    buildLeafCondition: (leafFilter) =>
      leaf.path.reduceRight<Record<string, unknown>>(
        (nested, key) => ({ [key]: nested }),
        leafFilter,
      ),
  });
}
