import { FieldMetadataType } from 'twenty-shared';

import {
  ObjectRecordFilter,
  ObjectRecordOrderBy,
  OrderByDirection,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { FieldMetadataMap } from 'src/engine/metadata-modules/types/field-metadata-map';

const computeOperator = (
  isAscending: boolean,
  isForwardPagination: boolean,
  defaultOperator?: string,
): string => {
  if (defaultOperator) return defaultOperator;

  return isAscending
    ? isForwardPagination
      ? 'gt'
      : 'lt'
    : isForwardPagination
      ? 'lt'
      : 'gt';
};

const validateAndGetOrderBy = (
  key: string,
  orderBy: ObjectRecordOrderBy,
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

const isAscendingOrder = (direction: OrderByDirection): boolean =>
  direction === OrderByDirection.AscNullsFirst ||
  direction === OrderByDirection.AscNullsLast;

export const computeCursorArgFilter = (
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
  value: any,
  fieldMetadataMapByName: FieldMetadataMap,
  orderBy: ObjectRecordOrderBy,
  isForwardPagination: boolean,
  operator?: string,
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
  value: any,
  fieldType: FieldMetadataType,
  orderBy: ObjectRecordOrderBy,
  isForwardPagination: boolean,
  operator?: string,
): Record<string, any> => {
  const compositeType = compositeTypeDefinitions.get(fieldType);

  if (!compositeType) {
    throw new GraphqlQueryRunnerException(
      `Composite type definition not found for type: ${fieldType}`,
      GraphqlQueryRunnerExceptionCode.INVALID_CURSOR,
    );
  }

  const keyOrderBy = validateAndGetOrderBy(key, orderBy);
  const result: Record<string, any> = {};

  compositeType.properties.forEach((property) => {
    if (
      property.type === FieldMetadataType.RAW_JSON ||
      value[property.name] === undefined
    ) {
      return;
    }

    const isAscending = isAscendingOrder(keyOrderBy[key][property.name]);
    const computedOperator = computeOperator(
      isAscending,
      isForwardPagination,
      operator,
    );

    result[key] = {
      ...result[key],
      [property.name]: {
        [computedOperator]: value[property.name],
      },
    };
  });

  return result;
};
