import {
  type FieldMetadataComplexOption,
  FieldMetadataType,
} from 'twenty-shared/types';

export const shouldUseCaseInsensitiveOrder = (
  fieldType: FieldMetadataType,
): boolean => {
  return fieldType === FieldMetadataType.TEXT;
};

export const isSelectFieldType = (fieldType: FieldMetadataType): boolean => {
  return (
    fieldType === FieldMetadataType.SELECT ||
    fieldType === FieldMetadataType.MULTI_SELECT
  );
};

export const shouldCastToText = (fieldType: FieldMetadataType): boolean => {
  return false;
};

export const getSelectOptionValuesSortedByPosition = (
  options: FieldMetadataComplexOption[] | null | undefined,
): string[] | undefined => {
  if (!options || options.length === 0) {
    return undefined;
  }

  return [...options]
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((option) => option.value);
};

// Returns unquoted column expression for TypeORM's orderBy (e.g., "company.name")
// Quoting and LOWER() wrapping is handled in getOrderByRawSQL
export const buildOrderByColumnExpression = (
  prefix: string,
  columnName: string,
): string => {
  return `${prefix}.${columnName}`;
};
