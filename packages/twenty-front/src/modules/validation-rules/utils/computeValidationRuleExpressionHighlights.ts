import { VALIDATION_RULE_FUNCTIONS } from 'twenty-shared/constants';
import { type ValidationRuleExpressionToken } from 'twenty-shared/types';
import {
  isDefined,
  tokenizeValidationRuleExpression,
} from 'twenty-shared/utils';

import { VALIDATION_RULE_KEYWORDS } from '@/validation-rules/constants/ValidationRuleKeywords';
import {
  type ValidationRuleExpressionHighlight,
  type ValidationRuleExpressionHighlightKind,
} from '@/validation-rules/types/ValidationRuleExpressionHighlight';

const VALIDATION_RULE_FUNCTION_NAMES = Object.keys(VALIDATION_RULE_FUNCTIONS);
const KEYWORD_NAMES = VALIDATION_RULE_KEYWORDS.map(({ name }) => name);
const OPERATOR_CHARACTERS = '=!<>+-*/%?:|&';

const getHighlightKind = ({
  token,
  functionNames,
}: {
  token: Pick<ValidationRuleExpressionToken, 'type' | 'text'>;
  functionNames: string[];
}): ValidationRuleExpressionHighlightKind | null => {
  switch (token.type) {
    case 'string':
    case 'unclosedString':
      return 'string';
    case 'number':
      return 'number';
    case 'path':
      if (functionNames.includes(token.text)) {
        return 'function';
      }

      return KEYWORD_NAMES.includes(token.text) ? 'keyword' : null;
    case 'symbol':
      return OPERATOR_CHARACTERS.includes(token.text) ? 'operator' : null;
    default:
      return null;
  }
};

export const computeValidationRuleExpressionHighlights = ({
  expression,
  functionNames = VALIDATION_RULE_FUNCTION_NAMES,
}: {
  expression: string;
  functionNames?: string[];
}): ValidationRuleExpressionHighlight[] =>
  tokenizeValidationRuleExpression(expression).flatMap((token) => {
    const kind = getHighlightKind({ token, functionNames });

    return isDefined(kind)
      ? [{ kind, start: token.start, end: token.end }]
      : [];
  });
