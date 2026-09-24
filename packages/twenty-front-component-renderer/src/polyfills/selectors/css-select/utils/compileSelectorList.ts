import { compileSelectorTokenList } from '@/polyfills/selectors/css-select/utils/compileSelectorTokenList';
import { parseSelectorList } from '@/polyfills/selectors/css-select/utils/parseSelectorList';
import { type CompiledSelectorMatcher } from '@/polyfills/selectors/types/CompiledSelectorMatcher';
import { createSelectorSyntaxError } from '@/polyfills/selectors/utils/createSelectorSyntaxError';

export const compileSelectorList = (
  selectorsText: string,
): CompiledSelectorMatcher => {
  try {
    return compileSelectorTokenList({
      tokenList: parseSelectorList(selectorsText),
      options: { isNested: false, isInsideHasArgument: false },
    });
  } catch {
    throw createSelectorSyntaxError(selectorsText);
  }
};
