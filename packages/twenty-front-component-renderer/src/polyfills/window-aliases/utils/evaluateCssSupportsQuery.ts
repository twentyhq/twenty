// Backs the sandbox CSS.supports: unknown or complex input is conservatively false

import { evaluateCssSupportsCondition } from '@/polyfills/window-aliases/utils/evaluateCssSupportsCondition';
import { evaluateCssSupportsDeclaration } from '@/polyfills/window-aliases/utils/evaluateCssSupportsDeclaration';

export const evaluateCssSupportsQuery = (
  supportsArguments: readonly unknown[],
): boolean => {
  const [firstArgument, secondArgument] = supportsArguments;

  const isPropertyValuePairForm = supportsArguments.length >= 2;

  if (isPropertyValuePairForm) {
    return evaluateCssSupportsDeclaration({
      property: String(firstArgument),
      value: String(secondArgument),
    });
  }

  const isConditionTextForm = supportsArguments.length === 1;

  if (isConditionTextForm) {
    return evaluateCssSupportsCondition(String(firstArgument));
  }

  return false;
};
