import { themeCssVariables } from 'twenty-ui/theme';

import { type ValidationRuleExpressionHighlightKind } from '@/validation-rules/types/ValidationRuleExpressionHighlight';

export const VALIDATION_RULE_HIGHLIGHT_COLORS: Record<
  ValidationRuleExpressionHighlightKind,
  string
> = {
  string: themeCssVariables.color.green11,
  number: themeCssVariables.color.orange11,
  function: themeCssVariables.color.blue11,
  keyword: themeCssVariables.color.pink11,
  operator: themeCssVariables.font.color.tertiary,
};
