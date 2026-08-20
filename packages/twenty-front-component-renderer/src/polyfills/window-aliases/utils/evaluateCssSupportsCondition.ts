import { evaluateCssSupportsDeclaration } from '@/polyfills/window-aliases/utils/evaluateCssSupportsDeclaration';
import { isSingleTopLevelCssGroup } from '@/utils/css/isSingleTopLevelCssGroup';
import { stripImportantPriorityFromCssValue } from '@/utils/css/stripImportantPriorityFromCssValue';

export const evaluateCssSupportsCondition = (condition: string): boolean => {
  const trimmedCondition = condition.trim();
  const isParenthesized = trimmedCondition.startsWith('(');

  if (isParenthesized && !isSingleTopLevelCssGroup(trimmedCondition)) {
    return false;
  }

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
