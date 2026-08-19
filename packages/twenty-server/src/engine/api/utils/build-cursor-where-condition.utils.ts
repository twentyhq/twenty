import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

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
import { buildCursorCompositeFieldWhereCondition } from 'src/engine/api/utils/build-cursor-composite-field-where-condition.utils';
import { buildCursorRelationFieldWhereCondition } from 'src/engine/api/utils/build-cursor-relation-field-where-condition.utils';
import { computeOperator } from 'src/engine/api/utils/compute-operator.utils';
import { isAscendingOrder } from 'src/engine/api/utils/is-ascending-order.utils';
import { validateAndGetOrderByForScalarField } from 'src/engine/api/utils/validate-and-get-order-by.utils';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

type BuildCursorWhereConditionParams = {
  cursorKey: string;
  cursorValue:
    | ObjectRecordCursorLeafScalarValue
    | ObjectRecordCursorLeafCompositeValue;
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  orderBy: ObjectRecordOrderBy;
  isForwardPagination: boolean;
  isEqualityCondition?: boolean;
};

// Returns null when no row can sort strictly after the cursor on this key alone
// (e.g. the cursor sits inside the trailing NULL block): the caller must then rely
// on the tie-breaking keys and drop this or-branch entirely.
export const buildCursorWhereCondition = ({
  cursorKey,
  cursorValue,
  flatObjectMetadata,
  flatFieldMetadataMaps,
  orderBy,
  isForwardPagination,
  isEqualityCondition = false,
}: BuildCursorWhereConditionParams): Record<string, unknown> | null => {
  const { fieldIdByName, fieldIdByJoinColumnName } =
    buildFieldMapsFromFlatObjectMetadata(
      flatFieldMetadataMaps,
      flatObjectMetadata,
    );

  const [fieldKey, ...subFieldPath] = cursorKey.split('.');
  const compositeSubFieldKey = subFieldPath.join('.');
  const fieldMetadataKey = fieldKey as keyof ObjectRecord;
  const isAccessedByFieldName = isDefined(fieldIdByName[fieldMetadataKey]);
  const fieldMetadataId =
    fieldIdByName[fieldMetadataKey] ??
    fieldIdByJoinColumnName[fieldMetadataKey];

  const fieldMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityMaps: flatFieldMetadataMaps,
    flatEntityId: fieldMetadataId,
  });

  if (!fieldMetadata) {
    throw new GraphqlQueryRunnerException(
      `Field metadata not found for key: ${String(cursorKey)}`,
      GraphqlQueryRunnerExceptionCode.INVALID_CURSOR,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  if (
    isAccessedByFieldName &&
    isMorphOrRelationFlatFieldMetadata(fieldMetadata)
  ) {
    return buildCursorRelationFieldWhereCondition({
      relationFieldMetadata: fieldMetadata,
      cursorValue,
      flatFieldMetadataMaps,
      orderBy,
      isForwardPagination,
      isEqualityCondition,
    });
  }

  if (
    isAccessedByFieldName &&
    isCompositeFieldMetadataType(fieldMetadata.type)
  ) {
    if (compositeSubFieldKey.length > 0) {
      return buildCursorCompositeFieldWhereCondition({
        fieldType: fieldMetadata.type,
        fieldKey: fieldMetadataKey,
        orderBy,
        cursorValue: {
          [compositeSubFieldKey]: cursorValue,
        } as ObjectRecordCursorLeafCompositeValue,
        isForwardPagination,
        isEqualityCondition,
      });
    }

    return buildCursorCompositeFieldWhereCondition({
      fieldType: fieldMetadata.type,
      fieldKey: fieldMetadataKey,
      orderBy,
      cursorValue: cursorValue as ObjectRecordCursorLeafCompositeValue,
      isForwardPagination,
      isEqualityCondition,
    });
  }

  if (isEqualityCondition) {
    if (cursorValue === null) {
      return { [fieldMetadataKey]: { is: 'NULL' } };
    }

    return { [fieldMetadataKey]: { eq: cursorValue } };
  }

  const keyOrderBy = validateAndGetOrderByForScalarField(
    fieldMetadataKey,
    orderBy,
  );
  const orderByDirection = keyOrderBy[fieldMetadataKey];

  if (!isDefined(orderByDirection)) {
    throw new GraphqlQueryRunnerException(
      'Invalid cursor',
      GraphqlQueryRunnerExceptionCode.INVALID_CURSOR,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  const isAscending = isAscendingOrder(orderByDirection);
  const computedOperator = computeOperator(isAscending, isForwardPagination);
  const areNullsScannedAfter = areNullsScannedAfterCursor(
    orderByDirection,
    isForwardPagination,
  );

  if (cursorValue === null) {
    // Inside the leading NULL block only the tie-breaking keys can advance the
    // scan; inside the trailing one nothing sorts after on this key at all
    return areNullsScannedAfter
      ? null
      : { [fieldMetadataKey]: { is: 'NOT_NULL' } };
  }

  const mainCondition = {
    [fieldMetadataKey]: { [computedOperator]: cursorValue },
  };

  // Fields with a Postgres null-equivalent default (e.g. TEXT '') never hold SQL
  // NULL, so they need no null continuation branch
  const canFieldHoldNullValue =
    fieldMetadata.isNullable !== false &&
    !isDefined(
      findPostgresDefaultNullEquivalentValue('NULL', fieldMetadata.type),
    );

  if (areNullsScannedAfter && canFieldHoldNullValue) {
    return {
      or: [mainCondition, { [fieldMetadataKey]: { is: 'NULL' } }],
    };
  }

  return mainCondition;
};
