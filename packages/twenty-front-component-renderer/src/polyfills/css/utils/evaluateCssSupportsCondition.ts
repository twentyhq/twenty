import { evaluateCssSupportsDeclaration } from '@/polyfills/css/utils/evaluateCssSupportsDeclaration';
import { splitCssDeclarations } from '@/utils/css/splitCssDeclarations';
import { stripImportantPriorityFromCssValue } from '@/utils/css/stripImportantPriorityFromCssValue';

export const evaluateCssSupportsCondition = (condition: string): boolean => {
  const trimmedCondition = condition.trim();
  const isParenthesized = trimmedCondition.startsWith('(');

  // Without a closing parenthesis the unwrapping below would eat a real character
  if (isParenthesized && !trimmedCondition.endsWith(')')) {
    return false;
  }

  const unwrappedCondition = isParenthesized
    ? trimmedCondition.slice(1, -1).trim()
    : trimmedCondition;

  if (unwrappedCondition.includes('(') || unwrappedCondition.includes(')')) {
    return false;
  }

  // A condition holds one declaration, so anything the quote-aware splitter
  // reads as several is malformed rather than a supported declaration.
  if (splitCssDeclarations(unwrappedCondition).length !== 1) {
    return false;
  }

  const declarationSeparatorIndex = unwrappedCondition.indexOf(':');

  if (declarationSeparatorIndex === -1) {
    return false;
  }

  return evaluateCssSupportsDeclaration({
    property: unwrappedCondition.slice(0, declarationSeparatorIndex).trim(),
    value: stripImportantPriorityFromCssValue(
      unwrappedCondition.slice(declarationSeparatorIndex + 1),
    ),
  });
};
