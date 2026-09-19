import { FieldMetadataType } from 'twenty-shared/types';

import { type OrderByClause } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-order/types/order-by-condition.type';

// MULTI_SELECT is left out even though its values are text: the column is an
// array, so the only case-insensitive expression available for it is
// LOWER(column::text) over the array literal, which no scalar cursor value can
// mirror. Ordering it raw keeps the scan and the keyset continuation on the
// same relation (issue #24359).
export const shouldUseCaseInsensitiveOrder = (
  fieldType: FieldMetadataType,
): boolean => {
  return (
    fieldType === FieldMetadataType.TEXT ||
    fieldType === FieldMetadataType.SELECT
  );
};

export const shouldCastToText = (fieldType: FieldMetadataType): boolean => {
  return fieldType === FieldMetadataType.SELECT;
};

// Returns unquoted column expression for the order parser's clause keys (e.g.,
// "company.name"). Quoting and LOWER() wrapping happen in
// renderOrderByColumnSql, which every ORDER BY rendering goes through.
export const buildOrderByColumnExpression = (
  prefix: string,
  columnName: string,
): string => {
  return `${prefix}.${columnName}`;
};

// An expression already carrying quotes or a call is rendered SQL (a group-by
// bucket, an aggregate): only a bare "alias.column" is ours to quote
const quoteOrderByColumnExpression = (columnExpression: string): string => {
  if (columnExpression.includes('"') || columnExpression.includes('(')) {
    return columnExpression;
  }

  const parts = columnExpression.split('.');

  return parts.length === 2
    ? `"${parts[0]}"."${parts[1]}"`
    : `"${columnExpression}"`;
};

// The one SQL rendering of an ordered column. Every ORDER BY compiles it, and
// the keyset cursor conditions compare on the same expression, so the scan
// order and the continuation cannot disagree about the ordering relation.
export const renderOrderByColumnSql = (
  columnExpression: string,
  { useLower, castToText }: Pick<OrderByClause, 'useLower' | 'castToText'>,
): string => {
  const quotedColumn = quoteOrderByColumnExpression(columnExpression);
  const castColumn = castToText ? `${quotedColumn}::text` : quotedColumn;

  return useLower ? `LOWER(${castColumn})` : castColumn;
};
