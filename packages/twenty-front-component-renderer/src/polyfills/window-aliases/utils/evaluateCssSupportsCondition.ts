import { evaluateCssSupportsDeclaration } from '@/polyfills/window-aliases/utils/evaluateCssSupportsDeclaration';
import { stripImportantPriorityFromCssValue } from '@/utils/css/stripImportantPriorityFromCssValue';

const COMPLEX_SUPPORTS_CONDITION_PATTERN = /\b(?:and|or|not|selector)\b/i;

export const evaluateCssSupportsCondition = (condition: string): boolean => {
  const trimmedCondition = condition.trim();

  if (COMPLEX_SUPPORTS_CONDITION_PATTERN.test(trimmedCondition)) {
    return false;
  }

  const isParenthesized =
    trimmedCondition.startsWith('(') && trimmedCondition.endsWith(')');

  const unwrappedCondition = isParenthesized
    ? trimmedCondition.slice(1, -1).trim()
    : trimmedCondition;

  if (unwrappedCondition.includes('(') || unwrappedCondition.includes(')')) {
    return false;
  }

  const declarationSeparatorIndex = unwrappedCondition.indexOf(':');

  if (declarationSeparatorIndex === -1) {
    return false;
  }

  return evaluateCssSupportsDeclaration({
    property: unwrappedCondition.slice(0, declarationSeparatorIndex),
    value: stripImportantPriorityFromCssValue(
      unwrappedCondition.slice(declarationSeparatorIndex + 1),
    ),
  });
};
