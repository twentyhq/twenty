import { evaluateCssSupportsCondition } from '@/polyfills/window-aliases/utils/evaluateCssSupportsCondition';
import { evaluateCssSupportsDeclaration } from '@/polyfills/window-aliases/utils/evaluateCssSupportsDeclaration';

export const evaluateCssSupportsQuery = (
  supportsArguments: readonly unknown[],
): boolean => {
  const [firstArgument, secondArgument] = supportsArguments;

  if (supportsArguments.length >= 2) {
    return evaluateCssSupportsDeclaration({
      property: String(firstArgument),
      value: String(secondArgument),
    });
  }

  if (supportsArguments.length === 1) {
    return evaluateCssSupportsCondition(String(firstArgument));
  }

  return false;
};
