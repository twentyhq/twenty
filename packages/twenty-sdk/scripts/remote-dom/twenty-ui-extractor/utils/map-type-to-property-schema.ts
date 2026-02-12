import { type Type } from 'ts-morph';

import { type PropertySchema } from '@/front-component/types/PropertySchema';
import { isNonEmptyArray } from 'twenty-shared/utils';

type PropertyType = PropertySchema['type'];

export const mapTypeToPropertySchema = (
  propertyType: Type,
): PropertyType | null => {
  if (propertyType.isString() || propertyType.isStringLiteral()) {
    return 'string';
  }

  if (propertyType.isNumber() || propertyType.isNumberLiteral()) {
    return 'number';
  }

  if (propertyType.isBoolean() || propertyType.isBooleanLiteral()) {
    return 'boolean';
  }

  if (propertyType.isArray()) {
    return 'array';
  }

  if (propertyType.isTuple()) {
    return 'array';
  }

  const callSignatures = propertyType.getCallSignatures();

  if (isNonEmptyArray(callSignatures)) {
    return 'function';
  }

  if (propertyType.isUnion()) {
    const unionMemberTypes = propertyType.getUnionTypes();

    const nonNullableTypes = unionMemberTypes.filter(
      (memberType) => !memberType.isUndefined() && !memberType.isNull(),
    );

    if (!isNonEmptyArray(nonNullableTypes)) {
      return null;
    }

    const classifiedTypeSet = new Set(
      nonNullableTypes.map((memberType) => mapTypeToPropertySchema(memberType)),
    );

    if (classifiedTypeSet.size === 1) {
      return classifiedTypeSet.values().next().value ?? null;
    }

    const primitiveTypes = new Set(['string', 'number', 'boolean']);
    const allPrimitive = [...classifiedTypeSet].every(
      (type) => type !== null && primitiveTypes.has(type),
    );

    if (allPrimitive && classifiedTypeSet.size > 0) {
      return 'string';
    }
  }

  if (propertyType.isEnum() || propertyType.isEnumLiteral()) {
    return 'string';
  }

  if (propertyType.isObject() && !propertyType.isArray()) {
    return 'object';
  }

  return null;
};
