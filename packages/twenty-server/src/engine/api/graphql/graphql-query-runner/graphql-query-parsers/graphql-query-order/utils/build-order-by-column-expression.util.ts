import { FieldMetadataType } from 'twenty-shared/types';

export const shouldUseCaseInsensitiveOrder = (
  fieldType: FieldMetadataType,
): boolean => {
  return fieldType === FieldMetadataType.TEXT;
};

export const shouldCastToText = (_fieldType: FieldMetadataType): boolean => {
  return false;
};

export const isSelectFieldType = (fieldType: FieldMetadataType): boolean => {
  return (
    fieldType === FieldMetadataType.SELECT ||
    fieldType === FieldMetadataType.MULTI_SELECT
  );
};

export const getSelectOptionValuesSortedByPosition = (
  options: { position: number; value: string }[],
): string[] => {
  return [...options]
    .sort((a, b) => a.position - b.position)
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
