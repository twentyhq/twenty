import { FieldMetadataType } from 'twenty-shared/types';

export const shouldUseCaseInsensitiveOrder = (
  fieldType: FieldMetadataType,
): boolean => {
  return (
    fieldType === FieldMetadataType.TEXT ||
    fieldType === FieldMetadataType.SELECT ||
    fieldType === FieldMetadataType.MULTI_SELECT
  );
};

export const shouldCastToText = (fieldType: FieldMetadataType): boolean => {
  return (
    fieldType === FieldMetadataType.SELECT ||
    fieldType === FieldMetadataType.MULTI_SELECT
  );
};

// Returns unquoted column expression for TypeORM's orderBy (e.g., "company.name")
// Quoting and LOWER() wrapping is handled in getOrderByRawSQL
export const buildOrderByColumnExpression = (
  prefix: string,
  columnName: string,
): string => {
  return `${prefix}.${columnName}`;
};
