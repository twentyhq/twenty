import { isDefined, isPlainObject } from 'twenty-shared/utils';

import {
  type ObjectRecordCursorLeafCompositeValue,
  type ObjectRecordCursorLeafScalarValue,
  type ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { findPostgresDefaultNullEquivalentValue } from 'src/engine/api/common/common-args-processors/data-arg-processor/utils/find-postgres-default-null-equivalent-value.util';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { areNullsScannedAfterCursor } from 'src/engine/api/utils/are-nulls-scanned-after-cursor.utils';
import { computeOperator } from 'src/engine/api/utils/compute-operator.utils';
import { isAscendingOrder } from 'src/engine/api/utils/is-ascending-order.utils';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { isOrderByDirection } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-order/utils/is-order-by-direction.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

type BuildCursorRelationFieldWhereConditionParams = {
  relationFieldMetadata: FlatFieldMetadata;
  cursorValue:
    | ObjectRecordCursorLeafScalarValue
    | ObjectRecordCursorLeafCompositeValue;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  orderBy: ObjectRecordOrderBy;
  isForwardPagination: boolean;
  isEqualityCondition?: boolean;
};

const throwInvalidCursor = (message: string): never => {
  throw new GraphqlQueryRunnerException(
    message,
    GraphqlQueryRunnerExceptionCode.INVALID_CURSOR,
    { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
  );
};

// Continues a scan ordered by a to-one relation field (e.g. { company: { name } }).
// The condition is expressed as a one-hop relation sub-filter, which the filter
// parser resolves against the same LEFT JOIN the ordering uses. Rows without a
// related record surface as SQL NULLs of the joined column, so they belong to the
// NULL block of the ordering and are handled like nullable scalar keys.
export const buildCursorRelationFieldWhereCondition = ({
  relationFieldMetadata,
  cursorValue,
  flatFieldMetadataMaps,
  orderBy,
  isForwardPagination,
  isEqualityCondition = false,
}: BuildCursorRelationFieldWhereConditionParams): Record<
  string,
  unknown
> | null => {
  const relationFieldName = relationFieldMetadata.name;

  const relationOrderByEntry = orderBy.find(
    (orderByEntry) => relationFieldName in orderByEntry,
  );
  const relationOrderByValue = relationOrderByEntry?.[relationFieldName];

  if (!isPlainObject(relationOrderByValue)) {
    return throwInvalidCursor(
      `Invalid cursor: no relation orderBy found for field "${relationFieldName}"`,
    );
  }

  const orderedSubFieldNames = Object.keys(
    relationOrderByValue as Record<string, unknown>,
  );

  if (orderedSubFieldNames.length !== 1) {
    return throwInvalidCursor(
      `Cursor pagination supports ordering by exactly one field of relation "${relationFieldName}"`,
    );
  }

  const [subFieldName] = orderedSubFieldNames;
  const orderByDirection = (
    relationOrderByValue as Record<string, unknown>
  )[subFieldName];

  if (!isOrderByDirection(orderByDirection)) {
    return throwInvalidCursor(
      `Invalid orderBy direction for relation field "${relationFieldName}.${subFieldName}"`,
    );
  }

  if (!isPlainObject(cursorValue)) {
    return throwInvalidCursor(
      `Invalid cursor value for relation field "${relationFieldName}"`,
    );
  }

  const subFieldValue = (cursorValue as Record<string, unknown>)[subFieldName];

  if (subFieldValue === undefined) {
    return throwInvalidCursor(
      `Cursor is missing the value for orderBy field "${relationFieldName}.${subFieldName}": include the ordered relation field in the selection (e.g. "${relationFieldName} { ${subFieldName} }") so cursors can carry it`,
    );
  }

  const targetSubFieldMetadata = Object.values(
    flatFieldMetadataMaps.byUniversalIdentifier,
  ).find(
    (fieldMetadata) =>
      fieldMetadata?.objectMetadataId ===
        relationFieldMetadata.relationTargetObjectMetadataId &&
      fieldMetadata.name === subFieldName,
  );

  // Joined columns of types with a Postgres null-equivalent default (e.g. TEXT '')
  // are only ever NULL when the join found no row, and their `is: NULL` filter
  // operator also matches the null-equivalent value: target the join column
  // instead so the NULL block matches exactly the rows without a related record
  const subFieldSqlNullOnlyMeansMissingRelation =
    isDefined(targetSubFieldMetadata) &&
    isDefined(
      findPostgresDefaultNullEquivalentValue(
        'NULL',
        targetSubFieldMetadata.type,
      ),
    );

  const joinColumnName = computeMorphOrRelationFieldJoinColumnName({
    name: relationFieldName,
  });

  const nullBlockCondition = subFieldSqlNullOnlyMeansMissingRelation
    ? { [joinColumnName]: { is: 'NULL' } }
    : { [relationFieldName]: { [subFieldName]: { is: 'NULL' } } };
  const outsideNullBlockCondition = subFieldSqlNullOnlyMeansMissingRelation
    ? { [joinColumnName]: { is: 'NOT_NULL' } }
    : { [relationFieldName]: { [subFieldName]: { is: 'NOT_NULL' } } };

  if (isEqualityCondition) {
    if (subFieldValue === null) {
      return nullBlockCondition;
    }

    return { [relationFieldName]: { [subFieldName]: { eq: subFieldValue } } };
  }

  const isAscending = isAscendingOrder(orderByDirection);
  const computedOperator = computeOperator(isAscending, isForwardPagination);
  const areNullsScannedAfter = areNullsScannedAfterCursor(
    orderByDirection,
    isForwardPagination,
  );

  if (subFieldValue === null) {
    return areNullsScannedAfter ? null : outsideNullBlockCondition;
  }

  const mainCondition = {
    [relationFieldName]: { [subFieldName]: { [computedOperator]: subFieldValue } },
  };

  if (areNullsScannedAfter) {
    return { or: [mainCondition, nullBlockCondition] };
  }

  return mainCondition;
};
