import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

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
import { buildCursorCompositeFieldWhereCondition } from 'src/engine/api/utils/build-cursor-composite-field-where-condition.utils';
import { computeOperator } from 'src/engine/api/utils/compute-operator.utils';
import { isAscendingOrder } from 'src/engine/api/utils/is-ascending-order.utils';
import { validateAndGetOrderByForScalarField } from 'src/engine/api/utils/validate-and-get-order-by.utils';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
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

export const buildCursorWhereCondition = ({
  cursorKey,
  cursorValue,
  flatObjectMetadata,
  flatFieldMetadataMaps,
  orderBy,
  isForwardPagination,
  isEqualityCondition = false,
}: BuildCursorWhereConditionParams): Record<string, unknown> => {
  const { fieldIdByName } = buildFieldMapsFromFlatObjectMetadata(
    flatFieldMetadataMaps,
    flatObjectMetadata,
  );

  const [fieldKey, ...subFieldPath] = cursorKey.split('.');
  const compositeSubFieldKey = subFieldPath.join('.');
  const fieldMetadataKey = fieldKey as keyof ObjectRecord;
  const fieldMetadataId = fieldIdByName[fieldMetadataKey];

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

  if (isCompositeFieldMetadataType(fieldMetadata.type)) {
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

  return { [fieldMetadataKey]: { [computedOperator]: cursorValue } };
};
