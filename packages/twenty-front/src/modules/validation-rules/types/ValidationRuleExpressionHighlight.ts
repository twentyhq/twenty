export type ValidationRuleExpressionHighlightKind =
  | 'string'
  | 'number'
  | 'function'
  | 'keyword'
  | 'operator';

export type ValidationRuleExpressionHighlight = {
  kind: ValidationRuleExpressionHighlightKind;
  start: number;
  end: number;
};
