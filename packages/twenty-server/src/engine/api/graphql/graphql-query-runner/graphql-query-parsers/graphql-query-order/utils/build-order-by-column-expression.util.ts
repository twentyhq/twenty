import { FieldMetadataType } from 'twenty-shared/types';

export const buildOrderByColumnExpression = (
  prefix: string,
  columnName: string,
  fieldType: FieldMetadataType,
): string => {
  const isEnumType =
    fieldType === FieldMetadataType.SELECT ||
    fieldType === FieldMetadataType.MULTI_SELECT;
  const isTextBased = fieldType === FieldMetadataType.TEXT || isEnumType;

  const casting = isEnumType ? '::text' : '';
  const columnExpr = `${prefix}.${columnName}${casting}`;

  return isTextBased ? `LOWER(${columnExpr})` : columnExpr;
};
