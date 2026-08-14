import { evaluateCssSupportsDeclaration } from '@/polyfills/window-aliases/utils/evaluateCssSupportsDeclaration';

const COMPLEX_SUPPORTS_CONDITION_PATTERN = /\b(?:and|or|not|selector)\b/i;

export const evaluateCssSupportsCondition = (condition: string): boolean => {
  const trimmedCondition = condition.trim();

  if (COMPLEX_SUPPORTS_CONDITION_PATTERN.test(trimmedCondition)) {
    return false;
  }

  const unwrappedCondition =
    trimmedCondition.startsWith('(') && trimmedCondition.endsWith(')')
      ? trimmedCondition.slice(1, -1).trim()
      : trimmedCondition;

  if (unwrappedCondition.includes('(') || unwrappedCondition.includes(')')) {
    return false;
  }

  const declarationSeparatorIndex = unwrappedCondition.indexOf(':');

  if (declarationSeparatorIndex === -1) {
    return false;
  }

  return evaluateCssSupportsDeclaration(
    unwrappedCondition.slice(0, declarationSeparatorIndex),
    unwrappedCondition.slice(declarationSeparatorIndex + 1),
  );
};
