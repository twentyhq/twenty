import { isDefined } from 'twenty-shared/utils';

import { type CompileSelectorTokenList } from '@/polyfills/selectors/css-select/types/CompileSelectorTokenList';
import { type SelectorCompilationOptions } from '@/polyfills/selectors/css-select/types/SelectorCompilationOptions';
import { createNthPseudoClassMatcher } from '@/polyfills/selectors/css-select/utils/createNthPseudoClassMatcher';
import { parseSelectorList } from '@/polyfills/selectors/css-select/utils/parseSelectorList';
import { type CompiledSelectorMatcher } from '@/polyfills/selectors/types/CompiledSelectorMatcher';
import { parseNthChildOfSelectorArgument } from '@/polyfills/selectors/utils/parseNthChildOfSelectorArgument';
import { parseNthFormula } from '@/polyfills/selectors/utils/parseNthFormula';

export const compileNthPseudoClass = ({
  argument,
  isCountedFromEnd,
  isOfType,
  options,
  compileSelectorTokenList,
}: {
  argument: string;
  isCountedFromEnd: boolean;
  isOfType: boolean;
  options: SelectorCompilationOptions;
  compileSelectorTokenList: CompileSelectorTokenList;
}): CompiledSelectorMatcher => {
  const nthChildOfSelectorArgument = isOfType
    ? null
    : parseNthChildOfSelectorArgument(argument);

  if (isDefined(nthChildOfSelectorArgument)) {
    return createNthPseudoClassMatcher({
      nthFormula: nthChildOfSelectorArgument.nthFormula,
      isCountedFromEnd,
      isOfType,
      ofSelectorMatcher: compileSelectorTokenList({
        tokenList: parseSelectorList(nthChildOfSelectorArgument.selectorsText),
        options: { ...options, isNested: true },
      }),
    });
  }

  const nthFormula = parseNthFormula(argument);

  if (!isDefined(nthFormula)) {
    throw new Error(`Invalid An+B argument ${argument}`);
  }

  return createNthPseudoClassMatcher({
    nthFormula,
    isCountedFromEnd,
    isOfType,
    ofSelectorMatcher: null,
  });
};
