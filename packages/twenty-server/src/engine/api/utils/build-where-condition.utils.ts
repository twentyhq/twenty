import { isDefined } from 'twenty-shared/utils';

import {
  ObjectRecord,
  ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { buildCompositeFieldWhereCondition } from 'src/engine/api/utils/build-composite-field-where-condition.utils';
import { computeOperator } from 'src/engine/api/utils/compute-operator.utils';
import { isAscendingOrder } from 'src/engine/api/utils/is-ascending-order.utils';
import { validateAndGetOrderByForNonCompositeFields } from 'src/engine/api/utils/validate-and-get-order-by.utils';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { FieldMetadataMap } from 'src/engine/metadata-modules/types/field-metadata-map';

export const buildWhereCondition = (
  key: keyof ObjectRecord,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
  fieldMetadataMapByName: FieldMetadataMap,
  orderBy: ObjectRecordOrderBy,
  isForwardPagination: boolean,
  operator?: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Record<string, any> => {
  const fieldMetadata = fieldMetadataMapByName[key];

  if (!fieldMetadata) {
    throw new GraphqlQueryRunnerException(
      `Field metadata not found for key: ${key}`,
      GraphqlQueryRunnerExceptionCode.INVALID_CURSOR,
    );
  }

  if (isCompositeFieldMetadataType(fieldMetadata.type)) {
    return buildCompositeFieldWhereCondition({
      fieldType: fieldMetadata.type,
      fieldKey: key,
      orderBy,
      cursorValue: value,
      isForwardPagination,
      operator,
    });
  }

  const keyOrderBy = validateAndGetOrderByForNonCompositeFields(key, orderBy);
  const orderByDirection = keyOrderBy[key];

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

  return { [key]: { [computedOperator]: value } };
};
