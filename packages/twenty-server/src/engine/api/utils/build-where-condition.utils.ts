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
import { buildCompositeFieldWhereCondition } from 'src/engine/api/utils/build-composite-field-where-condition.utils';
import { computeOperator } from 'src/engine/api/utils/compute-operator.utils';
import { isAscendingOrder } from 'src/engine/api/utils/is-ascending-order.utils';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { FieldMetadataMap } from 'src/engine/metadata-modules/types/field-metadata-map';
import { validateAndGetOrderByForScalarField } from 'src/engine/api/utils/validate-and-get-order-by.utils';

type BuildWhereConditionParams = {
  cursorKey: keyof ObjectRecord;
  cursorValue:
    | ObjectRecordCursorLeafScalarValue
    | ObjectRecordCursorLeafCompositeValue;
  fieldMetadataMapByName: FieldMetadataMap;
  orderBy: ObjectRecordOrderBy;
  isForwardPagination: boolean;
  operator?: string;
};

export const buildWhereCondition = ({
  cursorKey,
  cursorValue,
  fieldMetadataMapByName,
  orderBy,
  isForwardPagination,
  operator,
}: BuildWhereConditionParams): Record<string, unknown> => {
  const fieldMetadata = fieldMetadataMapByName[cursorKey];

  if (!fieldMetadata) {
    throw new GraphqlQueryRunnerException(
      `Field metadata not found for key: ${cursorKey}`,
      GraphqlQueryRunnerExceptionCode.INVALID_CURSOR,
    );
  }

  if (isCompositeFieldMetadataType(fieldMetadata.type)) {
    return buildCompositeFieldWhereCondition({
      fieldType: fieldMetadata.type,
      fieldKey: cursorKey,
      orderBy,
      cursorValue: cursorValue as ObjectRecordCursorLeafCompositeValue,
      isForwardPagination,
      operator,
    });
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
  const computedOperator = computeOperator(
    isAscending,
    isForwardPagination,
    operator,
  );

  return { [cursorKey]: { [computedOperator]: cursorValue } };
};
