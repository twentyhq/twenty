import { isDefined } from 'twenty-shared/utils';

import {
  ObjectRecord,
  ObjectRecordCursorLeafCompositeValue,
  ObjectRecordCursorLeafScalarValue,
  ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { computeOperator } from 'src/engine/api/utils/compute-operator.utils';
import { isAscendingOrder } from 'src/engine/api/utils/is-ascending-order.utils';
import { validateAndGetOrderByForScalarField } from 'src/engine/api/utils/validate-and-get-order-by.utils';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { FieldMetadataMap } from 'src/engine/metadata-modules/types/field-metadata-map';
import { buildCursorCompositeFieldWhereCondition } from 'src/engine/api/utils/build-cursor-composite-field-where-condition.utils';

type BuildCursorWhereConditionParams = {
  cursorKey: keyof ObjectRecord;
  cursorValue:
    | ObjectRecordCursorLeafScalarValue
    | ObjectRecordCursorLeafCompositeValue;
  fieldMetadataMapByName: FieldMetadataMap;
  orderBy: ObjectRecordOrderBy;
  isForwardPagination: boolean;
  isEqualityCondition?: boolean;
};

export const buildCursorWhereCondition = ({
  cursorKey,
  cursorValue,
  fieldMetadataMapByName,
  orderBy,
  isForwardPagination,
  isEqualityCondition = false,
}: BuildCursorWhereConditionParams): Record<string, unknown> => {
  const fieldMetadata = fieldMetadataMapByName[cursorKey];

  if (!fieldMetadata) {
    throw new GraphqlQueryRunnerException(
      `Field metadata not found for key: ${cursorKey}`,
      GraphqlQueryRunnerExceptionCode.INVALID_CURSOR,
    );
  }

  if (isCompositeFieldMetadataType(fieldMetadata.type)) {
    return buildCursorCompositeFieldWhereCondition({
      fieldType: fieldMetadata.type,
      fieldKey: cursorKey,
      orderBy,
      cursorValue: cursorValue as ObjectRecordCursorLeafCompositeValue,
      isForwardPagination,
      isEqualityCondition,
    });
  }

  if (isEqualityCondition) {
    return { [cursorKey]: { eq: cursorValue } };
  }

  const keyOrderBy = validateAndGetOrderByForScalarField(cursorKey, orderBy);
  const orderByDirection = keyOrderBy[cursorKey];

  if (!isDefined(orderByDirection)) {
    throw new GraphqlQueryRunnerException(
      'Invalid cursor',
      GraphqlQueryRunnerExceptionCode.INVALID_CURSOR,
    );
  }

  const isAscending = isAscendingOrder(orderByDirection);
  const computedOperator = computeOperator(isAscending, isForwardPagination);

  return { [cursorKey]: { [computedOperator]: cursorValue } };
};
