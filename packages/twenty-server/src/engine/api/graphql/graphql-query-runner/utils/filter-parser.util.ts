import {
  FindOptionsOrderValue,
  FindOptionsWhere,
  ILike,
  In,
  IsNull,
  LessThan,
  LessThanOrEqual,
  Like,
  MoreThan,
  MoreThanOrEqual,
  Not,
  ObjectLiteral,
} from 'typeorm';

import { RecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';
import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { compositeTypeDefintions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { CompositeFieldMetadataType } from 'src/engine/metadata-modules/workspace-migration/factories/composite-column-action.factory';
import { capitalize } from 'src/utils/capitalize';

export const parseFilter = (
  recordFilter: RecordFilter,
  fieldMetadataMap: Map<string, FieldMetadataInterface>,
): FindOptionsWhere<ObjectLiteral> | FindOptionsWhere<ObjectLiteral>[] => {
  return parseFilterRecursive(recordFilter, fieldMetadataMap);
};

const parseFilterRecursive = (
  filter: RecordFilter,
  fieldMetadataMap: Map<string, FieldMetadataInterface>,
): FindOptionsWhere<ObjectLiteral> | FindOptionsWhere<ObjectLiteral>[] => {
  if (typeof filter !== 'object' || filter === null) {
    return filter;
  }

  if (Array.isArray(filter)) {
    return filter.map((item) => parseFilterRecursive(item, fieldMetadataMap));
  }

  const result: FindOptionsWhere<ObjectLiteral> = {};

  for (const [key, value] of Object.entries(filter)) {
    if (key === 'or') {
      if (!Array.isArray(value)) {
        throw new Error(
          "'or' operator must be followed by an array of conditions",
        );
      }

      return value.map((condition) =>
        parseFilterRecursive(condition, fieldMetadataMap),
      );
    } else if (key === 'and') {
      if (!Array.isArray(value)) {
        throw new Error(
          "'and' operator must be followed by an array of conditions",
        );
      }
      Object.assign(
        result,
        ...value.map((condition) =>
          parseFilterRecursive(condition, fieldMetadataMap),
        ),
      );
    } else if (key === 'not') {
      result[key] = Not(parseFilterRecursive(value, fieldMetadataMap));
    } else {
      const fieldMetadata = fieldMetadataMap.get(key);

      if (!fieldMetadata) {
        result[key] = parseFilterRecursive(value, fieldMetadataMap);
      } else if (isCompositeFieldMetadataType(fieldMetadata.type)) {
        const compositeFilter = handleCompositeFieldForFilter(
          fieldMetadata,
          value,
        );

        Object.assign(result, compositeFilter);
      } else if (typeof value === 'object' && value !== null) {
        result[key] = parseOperator(value);
      } else {
        result[key] = value;
      }
    }
  }

  return result;
};
const handleCompositeFieldForFilter = (
  fieldMetadata: FieldMetadataInterface,
  fieldValue: any,
): FindOptionsWhere<ObjectLiteral> => {
  const compositeType = compositeTypeDefintions.get(
    fieldMetadata.type as CompositeFieldMetadataType,
  );

  if (!compositeType) {
    throw new Error(
      `Composite type definition not found for type: ${fieldMetadata.type}`,
    );
  }

  return Object.entries(fieldValue).reduce(
    (result, [subFieldKey, subFieldValue]) => {
      const subFieldMetadata = compositeType.properties.find(
        (property) => property.name === subFieldKey,
      );

      if (!subFieldMetadata) {
        throw new Error(
          `Sub field metadata not found for composite type: ${fieldMetadata.type}`,
        );
      }

      const fullFieldName = `${fieldMetadata.name}${capitalize(subFieldKey)}`;

      if (typeof subFieldValue === 'object' && subFieldValue !== null) {
        result[fullFieldName] = parseOperator(subFieldValue);
      } else {
        result[fullFieldName] = subFieldValue;
      }

      return result;
    },
    {} as FindOptionsWhere<ObjectLiteral>,
  );
};

const operatorMap = {
  eq: (value: any) => value,
  neq: (value: any) => Not(value),
  gt: (value: any) => MoreThan(value),
  gte: (value: any) => MoreThanOrEqual(value),
  lt: (value: any) => LessThan(value),
  lte: (value: any) => LessThanOrEqual(value),
  in: (value: any) => In(value),
  is: (value: any) => (value === 'NULL' ? IsNull() : value),
  like: (value: string) => Like(`%${value}%`),
  ilike: (value: string) => ILike(`%${value}%`),
  startsWith: (value: string) => ILike(`${value}%`),
  endsWith: (value: string) => ILike(`%${value}`),
};

const parseOperator = (operatorObj: Record<string, any>): any => {
  const [[operator, value]] = Object.entries(operatorObj);

  if (operator in operatorMap) {
    return operatorMap[operator](value);
  }

  throw new Error(`Operator not supported: ${operator}`);
};

export const applyRangeFilter = (
  where: FindOptionsWhere<ObjectLiteral>,
  order: Record<string, FindOptionsOrderValue> | undefined,
  cursor: Record<string, any>,
): FindOptionsWhere<ObjectLiteral> => {
  if (!order) return where;

  const orderEntries = Object.entries(order);

  orderEntries.forEach(([column, config], index) => {
    if (typeof config !== 'object' || !('direction' in config)) {
      return;
    }
    where[column] =
      config.direction === 'ASC'
        ? MoreThan(cursor[index])
        : LessThan(cursor[index]);
  });

  return where;
};
