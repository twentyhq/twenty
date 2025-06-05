import { FieldMetadataType } from 'twenty-shared/types';

import {
  ObjectRecordFilter,
  ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { buildLexicographicOrdering } from 'src/engine/api/utils/build-lexicographic-ordering.utils';
import { computeOperator } from 'src/engine/api/utils/compute-operator.utils';
import { isAscendingOrder } from 'src/engine/api/utils/is-ascending-order.utils';
import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { FieldMetadataMap } from 'src/engine/metadata-modules/types/field-metadata-map';

const validateAndGetOrderBy = (
  key: string,
  orderBy: ObjectRecordOrderBy,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Record<string, any> => {
  const keyOrderBy = orderBy.find((order) => key in order);

  if (!keyOrderBy) {
    throw new GraphqlQueryRunnerException(
      'Invalid cursor',
      GraphqlQueryRunnerExceptionCode.INVALID_CURSOR,
    );
  }

  return keyOrderBy;
};

export const computeCursorArgFilter = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cursor: Record<string, any>,
  orderBy: ObjectRecordOrderBy,
  fieldMetadataMapByName: FieldMetadataMap,
  isForwardPagination = true,
): ObjectRecordFilter[] => {
  const cursorKeys = Object.keys(cursor ?? {});
  const cursorValues = Object.values(cursor ?? {});

  if (cursorKeys.length === 0) {
    return [];
  }

  return Object.entries(cursor ?? {}).map(([key, value], index) => {
    let whereCondition = {};

    for (
      let subConditionIndex = 0;
      subConditionIndex < index;
      subConditionIndex++
    ) {
      whereCondition = {
        ...whereCondition,
        ...buildWhereCondition(
          cursorKeys[subConditionIndex],
          cursorValues[subConditionIndex],
          fieldMetadataMapByName,
          orderBy,
          isForwardPagination,
          'eq',
        ),
      };
    }

    return {
      ...whereCondition,
      ...buildWhereCondition(
        key,
        value,
        fieldMetadataMapByName,
        orderBy,
        isForwardPagination,
      ),
    } as ObjectRecordFilter;
  });
};

const buildWhereCondition = (
  key: string,
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
    return buildCompositeWhereCondition(
      key,
      value,
      fieldMetadata.type,
      orderBy,
      isForwardPagination,
      operator,
    );
  }

  const keyOrderBy = validateAndGetOrderBy(key, orderBy);
  const isAscending = isAscendingOrder(keyOrderBy[key]);
  const computedOperator = computeOperator(
    isAscending,
    isForwardPagination,
    operator,
  );

  return { [key]: { [computedOperator]: value } };
};

const buildCompositeWhereCondition = (
  key: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
  fieldType: FieldMetadataType,
  orderBy: ObjectRecordOrderBy,
  isForwardPagination: boolean,
  operator?: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Record<string, any> => {
  const compositeType = compositeTypeDefinitions.get(fieldType);

  if (!compositeType) {
    throw new GraphqlQueryRunnerException(
      `Composite type definition not found for type: ${fieldType}`,
      GraphqlQueryRunnerExceptionCode.INVALID_CURSOR,
    );
  }

  const keyOrderBy = validateAndGetOrderBy(key, orderBy);

  const filteredProperties = compositeType.properties.filter(
    (property) =>
      property.type !== FieldMetadataType.RAW_JSON &&
      value[property.name] !== undefined,
  );

  if (operator === 'eq') {
    const result: Record<string, object> = {};

    filteredProperties.forEach((property) => {
      result[key] = {
        ...result[key],
        [property.name]: {
          eq: value[property.name],
        },
      };
    });

    return result;
  }

  return buildLexicographicOrdering(
    filteredProperties,
    key,
    keyOrderBy,
    value,
    isForwardPagination,
    operator,
  );
};
