import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type CompileSelectorTokenList } from '@/polyfills/selectors/css-select/types/CompileSelectorTokenList';
import { type SelectorCompilationOptions } from '@/polyfills/selectors/css-select/types/SelectorCompilationOptions';
import { type SelectorToken } from '@/polyfills/selectors/css-select/types/SelectorToken';
import { compileSelectorToken } from '@/polyfills/selectors/css-select/utils/compileSelectorToken';
import { isPseudoElementToken } from '@/polyfills/selectors/css-select/utils/isPseudoElementToken';
import { isSelectorTraversalToken } from '@/polyfills/selectors/css-select/utils/isSelectorTraversalToken';
import { type CompiledSelectorMatcher } from '@/polyfills/selectors/types/CompiledSelectorMatcher';

const ALWAYS_MATCHING_SELECTOR_MATCHER: CompiledSelectorMatcher = () => true;

const assertPseudoElementIsInLastTopLevelCompound = ({
  tokens,
  options,
}: {
  tokens: SelectorToken[];
  options: SelectorCompilationOptions;
}): void => {
  const pseudoElementIndex = tokens.findIndex(isPseudoElementToken);

  if (pseudoElementIndex < 0) {
    return;
  }

  if (
    options.isNested ||
    tokens.slice(pseudoElementIndex).some(isSelectorTraversalToken)
  ) {
    throw new Error(
      'Pseudo-elements are only allowed at the end of a top-level selector',
    );
  }
};

const compileComplexSelectorTokens = ({
  tokens,
  options,
  relativeSelectorAnchorMatcher,
}: {
  tokens: SelectorToken[];
  options: SelectorCompilationOptions;
  relativeSelectorAnchorMatcher?: CompiledSelectorMatcher;
}): CompiledSelectorMatcher => {
  const lastToken = tokens[tokens.length - 1];

  if (!isDefined(lastToken) || isSelectorTraversalToken(lastToken)) {
    throw new Error('Expected a selector after the last combinator');
  }

  if (
    !isDefined(relativeSelectorAnchorMatcher) &&
    isSelectorTraversalToken(tokens[0])
  ) {
    throw new Error('Relative selectors are only allowed inside :has()');
  }

  assertPseudoElementIsInLastTopLevelCompound({ tokens, options });

  return tokens.reduce<CompiledSelectorMatcher>(
    (next, token) =>
      compileSelectorToken({
        next,
        token,
        options,
        compileSelectorTokenList,
      }),
    relativeSelectorAnchorMatcher ?? ALWAYS_MATCHING_SELECTOR_MATCHER,
  );
};

export const compileSelectorTokenList: CompileSelectorTokenList = ({
  tokenList,
  options,
  relativeSelectorAnchorMatcher,
}) => {
  const complexSelectorMatchers = tokenList.map((tokens) =>
    compileComplexSelectorTokens({
      tokens,
      options,
      relativeSelectorAnchorMatcher,
    }),
  );

  if (!isNonEmptyArray(complexSelectorMatchers)) {
    throw new Error('Expected at least one selector');
  }

  return (element, context) =>
    complexSelectorMatchers.some((complexSelectorMatcher) =>
      complexSelectorMatcher(element, context),
    );
};
