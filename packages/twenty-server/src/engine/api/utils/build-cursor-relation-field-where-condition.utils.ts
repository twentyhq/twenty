import { isDefined, isPlainObject } from 'twenty-shared/utils';

import {
  type ObjectRecordCursorLeafCompositeValue,
  type ObjectRecordCursorLeafScalarValue,
  type ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { isOrderByDirection } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-order/utils/is-order-by-direction.util';
import {
  buildCursorKeysetCondition,
  checkIfColumnHasNullEquivalentDefault,
} from 'src/engine/api/utils/build-cursor-keyset-condition.utils';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

type BuildCursorRelationFieldWhereConditionParams = {
  relationFieldMetadata: FlatFieldMetadata;
  cursorValue:
    | ObjectRecordCursorLeafScalarValue
    | ObjectRecordCursorLeafCompositeValue;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
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
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  orderBy,
  isForwardPagination,
  isEqualityCondition = false,
}: BuildCursorRelationFieldWhereConditionParams): Record<
  string,
  unknown
> | null => {
  const relationFieldName = relationFieldMetadata.name;

  const relationOrderByValue = orderBy.find(
    (orderByEntry) => relationFieldName in orderByEntry,
  )?.[relationFieldName];

  if (!isPlainObject(relationOrderByValue)) {
    return throwInvalidCursor(
      `Invalid cursor: no relation orderBy found for field "${relationFieldName}"`,
    );
  }

  const orderedSubFieldNames = Object.keys(relationOrderByValue);

  if (orderedSubFieldNames.length !== 1) {
    return throwInvalidCursor(
      `Cursor pagination supports ordering by exactly one field of relation "${relationFieldName}"`,
    );
  }

  const [subFieldName] = orderedSubFieldNames;
  const orderByDirection = relationOrderByValue[subFieldName];

  if (!isOrderByDirection(orderByDirection)) {
    return throwInvalidCursor(
      `Invalid orderBy direction for relation field "${relationFieldName}.${subFieldName}"`,
    );
  }

  const subFieldValue = isPlainObject(cursorValue)
    ? cursorValue[subFieldName]
    : undefined;

  if (subFieldValue === undefined) {
    // Unreachable through computeCursorArgFilter: the cursor/orderBy guard
    // already reports missing relation values with an actionable message
    return throwInvalidCursor(
      `Invalid cursor value for relation field "${relationFieldName}"`,
    );
  }

  const targetObjectMetadata = isDefined(
    relationFieldMetadata.relationTargetObjectMetadataId,
  )
    ? findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: relationFieldMetadata.relationTargetObjectMetadataId,
        flatEntityMaps: flatObjectMetadataMaps,
      })
    : undefined;
  const targetSubFieldMetadata = isDefined(targetObjectMetadata)
    ? findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: buildFieldMapsFromFlatObjectMetadata(
          flatFieldMetadataMaps,
          targetObjectMetadata,
        ).fieldIdByName[subFieldName],
        flatEntityMaps: flatFieldMetadataMaps,
      })
    : undefined;

  // Joined columns of types with a Postgres null-equivalent default (e.g. TEXT '')
  // are only ever NULL when the join found no row, and their `is: NULL` filter
  // operator also matches the null-equivalent value: target the join column
  // instead so the NULL block matches exactly the rows without a related record
  const isSubFieldNullOnlyWhenRelationIsMissing =
    isDefined(targetSubFieldMetadata) &&
    checkIfColumnHasNullEquivalentDefault(targetSubFieldMetadata.type);

  const joinColumnName = computeMorphOrRelationFieldJoinColumnName({
    name: relationFieldName,
  });

  return buildCursorKeysetCondition({
    cursorValue: subFieldValue,
    orderByDirection,
    isForwardPagination,
    isEqualityCondition,
    // A LEFT JOIN can always produce NULLs, whatever the target column's type
    canFieldHoldNullValue: true,
    buildLeafCondition: (leafFilter) => ({
      [relationFieldName]: { [subFieldName]: leafFilter },
    }),
    buildNullCheckCondition: (isNull) =>
      isSubFieldNullOnlyWhenRelationIsMissing
        ? { [joinColumnName]: { is: isNull ? 'NULL' : 'NOT_NULL' } }
        : {
            [relationFieldName]: {
              [subFieldName]: { is: isNull ? 'NULL' : 'NOT_NULL' },
            },
          },
  });
};
