import { evaluateCssSupportsDeclaration } from '@/polyfills/window-aliases/utils/evaluateCssSupportsDeclaration';

const COMPLEX_SUPPORTS_CONDITION_PATTERN = /\b(?:and|or|not|selector)\b/i;

export const evaluateCssSupportsCondition = (condition: string): boolean => {
  const trimmedCondition = condition.trim();

  const isComplexCondition =
    COMPLEX_SUPPORTS_CONDITION_PATTERN.test(trimmedCondition);

  if (isComplexCondition) {
    return false;
  }

  const isParenthesized =
    trimmedCondition.startsWith('(') && trimmedCondition.endsWith(')');

  const unwrappedCondition = isParenthesized
    ? trimmedCondition.slice(1, -1).trim()
    : trimmedCondition;

  const hasRemainingParentheses =
    unwrappedCondition.includes('(') || unwrappedCondition.includes(')');

  if (hasRemainingParentheses) {
    return false;
  }

  const declarationSeparatorIndex = unwrappedCondition.indexOf(':');
  const isPropertyValueDeclaration = declarationSeparatorIndex !== -1;

  if (!isPropertyValueDeclaration) {
    return false;
  }

  return evaluateCssSupportsDeclaration({
    property: unwrappedCondition.slice(0, declarationSeparatorIndex),
    value: unwrappedCondition.slice(declarationSeparatorIndex + 1),
  });
};
