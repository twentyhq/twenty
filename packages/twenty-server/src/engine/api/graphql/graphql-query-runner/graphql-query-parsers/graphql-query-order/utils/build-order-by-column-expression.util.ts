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

export const buildOrderByColumnExpression = (
  prefix: string,
  columnName: string,
  fieldType: FieldMetadataType,
): string => {
  const isEnumType =
    fieldType === FieldMetadataType.SELECT ||
    fieldType === FieldMetadataType.MULTI_SELECT;

  const casting = isEnumType ? '::text' : '';

  return `"${prefix}"."${columnName}"${casting}`;
};
