import {
  OrderByDirection,
  RecordFilter,
  RecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';

import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { FieldMetadataMap } from 'src/engine/metadata-modules/utils/generate-object-metadata-map.util';

export const computeCursorArgFilter = (
  cursor: Record<string, any>,
  orderBy: RecordOrderBy,
  fieldMetadataMap: FieldMetadataMap,
  isForwardPagination = true,
): RecordFilter[] => {
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
          fieldMetadataMap,
          'eq',
        ),
      };
    }

    const keyOrderBy = orderBy.find((order) => key in order);

    if (!keyOrderBy) {
      throw new GraphqlQueryRunnerException(
        'Invalid cursor',
        GraphqlQueryRunnerExceptionCode.INVALID_CURSOR,
      );
    }

    const isAscending =
      keyOrderBy[key] === OrderByDirection.AscNullsFirst ||
      keyOrderBy[key] === OrderByDirection.AscNullsLast;

    const operator = isAscending
      ? isForwardPagination
        ? 'gt'
        : 'lt'
      : isForwardPagination
        ? 'lt'
        : 'gt';

    return {
      ...whereCondition,
      ...buildWhereCondition(key, value, fieldMetadataMap, operator),
    } as RecordFilter;
  });
};

const buildWhereCondition = (
  key: string,
  value: any,
  fieldMetadataMap: FieldMetadataMap,
  operator: string,
): Record<string, any> => {
  const fieldMetadata = fieldMetadataMap[key];

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
      operator,
    );
  }

  return { [key]: { [operator]: value } };
};

const buildCompositeWhereCondition = (
  key: string,
  value: any,
  fieldType: FieldMetadataType,
  operator: string,
): Record<string, any> => {
  const compositeType = compositeTypeDefinitions.get(fieldType);

  if (!compositeType) {
    throw new GraphqlQueryRunnerException(
      `Composite type definition not found for type: ${fieldType}`,
      GraphqlQueryRunnerExceptionCode.INVALID_CURSOR,
    );
  }

  const result: Record<string, any> = {};

  compositeType.properties.forEach((property) => {
    if (
      property.type !== FieldMetadataType.RAW_JSON &&
      value[property.name] !== undefined
    ) {
      result[key] = {
        ...result[key],
        [property.name]: { [operator]: value[property.name] },
      };
    }
  });

  return result;
};
