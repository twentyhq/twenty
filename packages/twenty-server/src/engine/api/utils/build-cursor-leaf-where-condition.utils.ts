import { isDefined } from 'twenty-shared/utils';

import {
  buildCursorKeysetCondition,
  checkIfColumnHasNullEquivalentDefault,
} from 'src/engine/api/utils/build-cursor-keyset-condition.utils';
import { type OrderByLeaf } from 'src/engine/api/utils/resolve-order-by-leaves.utils';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';

// Composite sub-columns are NOT NULL whenever their type defines a Postgres
// null-equivalent default; scalar columns additionally honor field nullability;
// a LEFT JOIN can always produce NULLs, whatever the target column's type.
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
    case 'relation':
      return true;
  }
};

const nestAlongPath = (
  path: string[],
  leafFilter: Record<string, unknown>,
): Record<string, unknown> =>
  path.reduceRight<Record<string, unknown>>(
    (nested, key) => ({ [key]: nested }),
    leafFilter,
  );

// Joined columns of types with a Postgres null-equivalent default (e.g. TEXT '')
// are only ever NULL when the join found no row, and their `is: NULL` filter
// operator also matches the null-equivalent value: target the join column
// instead so the NULL block matches exactly the rows without a related record.
const buildRelationNullCheckCondition = (
  leaf: OrderByLeaf & { kind: 'relation' },
  isNull: boolean,
): Record<string, unknown> => {
  // The composite property's type is the joined column's primitive type
  const targetColumnType =
    leaf.targetCompositeProperty?.type ?? leaf.targetFieldMetadata?.type;
  const isTargetColumnNullOnlyWhenRelationIsMissing =
    isDefined(targetColumnType) &&
    checkIfColumnHasNullEquivalentDefault(targetColumnType);

  if (isTargetColumnNullOnlyWhenRelationIsMissing) {
    return {
      [computeMorphOrRelationFieldJoinColumnName({ name: leaf.path[0] })]: {
        is: isNull ? 'NULL' : 'NOT_NULL',
      },
    };
  }

  return nestAlongPath(leaf.path, { is: isNull ? 'NULL' : 'NOT_NULL' });
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
    buildLeafCondition: (leafFilter) => nestAlongPath(leaf.path, leafFilter),
    ...(leaf.kind === 'relation' && {
      buildNullCheckCondition: (isNull: boolean) =>
        buildRelationNullCheckCondition(leaf, isNull),
    }),
  });
}
