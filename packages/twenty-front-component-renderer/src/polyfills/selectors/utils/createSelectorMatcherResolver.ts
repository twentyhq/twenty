import { isDefined } from 'twenty-shared/utils';

import { SELECTOR_MATCHER_CACHE_SIZE } from '@/polyfills/selectors/constants/SelectorMatcherCacheSize';
import { compileSelectorList } from '@/polyfills/selectors/css-select/utils/compileSelectorList';
import { type CompiledSelectorMatcher } from '@/polyfills/selectors/types/CompiledSelectorMatcher';
import { type SelectorMatchContext } from '@/polyfills/selectors/types/SelectorMatchContext';
import { type SelectorMatcherResolver } from '@/polyfills/selectors/types/SelectorMatcherResolver';
import { resolveSelectorScopeTarget } from '@/polyfills/selectors/utils/resolveSelectorScopeTarget';

export const createSelectorMatcherResolver = ({
  resolveActiveElement,
}: {
  resolveActiveElement: () => object | null;
}): SelectorMatcherResolver => {
  const compiledMatcherBySelectorsText = new Map<
    string,
    CompiledSelectorMatcher
  >();

  const resolveCompiledMatcher = (
    selectorsText: string,
  ): CompiledSelectorMatcher => {
    const cachedMatcher = compiledMatcherBySelectorsText.get(selectorsText);

    if (isDefined(cachedMatcher)) {
      return cachedMatcher;
    }

    const compiledMatcher = compileSelectorList(selectorsText);

    if (compiledMatcherBySelectorsText.size >= SELECTOR_MATCHER_CACHE_SIZE) {
      const oldestSelectorsText = compiledMatcherBySelectorsText
        .keys()
        .next().value;

      if (isDefined(oldestSelectorsText)) {
        compiledMatcherBySelectorsText.delete(oldestSelectorsText);
      }
    }

    compiledMatcherBySelectorsText.set(selectorsText, compiledMatcher);

    return compiledMatcher;
  };

  return {
    resolveSelectorMatcher: ({ selectorsText, scopeElement }) => {
      const compiledMatcher = resolveCompiledMatcher(selectorsText);
      const context: SelectorMatchContext = {
        scopeElement: resolveSelectorScopeTarget(scopeElement),
        activeElement: resolveActiveElement(),
        hasSubjectElement: null,
      };

      return (element) => compiledMatcher(element, context);
    },
  };
};
