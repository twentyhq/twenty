import { FieldMetadataType } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

type FieldTypeInfo = Pick<FlatFieldMetadata, 'type'>;

const shouldCastToText = (fieldType: FieldMetadataType): boolean => {
  return (
    fieldType === FieldMetadataType.SELECT ||
    fieldType === FieldMetadataType.MULTI_SELECT
  );
};

export const shouldUseCaseInsensitiveOrder = (
  fieldType: FieldMetadataType,
): boolean => {
  return (
    fieldType === FieldMetadataType.TEXT ||
    fieldType === FieldMetadataType.SELECT ||
    fieldType === FieldMetadataType.MULTI_SELECT
  );
};

export const wrapWithLowerIfNeeded = (
  columnExpr: string,
  fieldType: FieldMetadataType,
): string => {
  if (shouldUseCaseInsensitiveOrder(fieldType)) {
    return `LOWER(${columnExpr})`;
  }

  return columnExpr;
};

export const buildOrderByColumnExpression = (
  prefix: string,
  columnName: string,
  fieldMetadata: FieldTypeInfo,
): string => {
  const casting = shouldCastToText(fieldMetadata.type) ? '::text' : '';
  const columnExpr = `${prefix}.${columnName}${casting}`;

  return wrapWithLowerIfNeeded(columnExpr, fieldMetadata.type);
};

