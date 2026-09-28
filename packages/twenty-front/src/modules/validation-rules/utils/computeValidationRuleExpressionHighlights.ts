import { VALIDATION_RULE_FUNCTIONS } from '@/validation-rules/constants/ValidationRuleFunctions';
import { VALIDATION_RULE_KEYWORDS } from '@/validation-rules/constants/ValidationRuleKeywords';
import {
  type ValidationRuleExpressionHighlight,
  type ValidationRuleExpressionHighlightKind,
} from '@/validation-rules/types/ValidationRuleExpressionHighlight';
import { type ValidationRuleExpressionToken } from '@/validation-rules/types/ValidationRuleExpressionToken';
import { tokenizeValidationRuleExpression } from '@/validation-rules/utils/tokenizeValidationRuleExpression';

const FUNCTION_NAMES = VALIDATION_RULE_FUNCTIONS.map(({ name }) => name);
const KEYWORD_NAMES = VALIDATION_RULE_KEYWORDS.map(({ name }) => name);
const OPERATOR_CHARACTERS = '=!<>+-*/%?:|&';

const getHighlightKind = (
  token: ValidationRuleExpressionToken,
): ValidationRuleExpressionHighlightKind | null => {
  switch (token.type) {
    case 'string':
    case 'unclosedString':
      return 'string';
    case 'number':
      return 'number';
    case 'path':
      if (FUNCTION_NAMES.includes(token.text)) {
        return 'function';
      }

      return KEYWORD_NAMES.includes(token.text) ? 'keyword' : null;
    case 'symbol':
      return OPERATOR_CHARACTERS.includes(token.text) ? 'operator' : null;
    default:
      return null;
  }
};

export const computeValidationRuleExpressionHighlights = (
  expression: string,
): ValidationRuleExpressionHighlight[] =>
  tokenizeValidationRuleExpression(expression).flatMap((token) => {
    const kind = getHighlightKind(token);

    return kind === null ? [] : [{ kind, start: token.start, end: token.end }];
  });
