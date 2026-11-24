// The value one stored column of a stored formula field must hold
export type StoredFormulaColumnExpression = {
  fieldName: string;
  compositePropertyName?: string;
  columnName: string;
  expression: string;
};
