import { compile } from 'css-select';
import { isDefined } from 'twenty-shared/utils';

import { SCOPE_PSEUDO_CLASS_PATTERN } from '@/polyfills/selectors/constants/ScopePseudoClassPattern';
import { SELECTOR_MATCHER_CACHE_SIZE } from '@/polyfills/selectors/constants/SelectorMatcherCacheSize';
import { WORKER_DOM_CSS_SELECT_ADAPTER } from '@/polyfills/selectors/constants/WorkerDomCssSelectAdapter';
import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { type SelectorMatcher } from '@/polyfills/selectors/types/SelectorMatcher';
import { type SelectorMatcherResolver } from '@/polyfills/selectors/types/SelectorMatcherResolver';
import { buildSelectorPseudoClassMatchers } from '@/polyfills/selectors/utils/buildSelectorPseudoClassMatchers';
import { createSelectorSyntaxError } from '@/polyfills/selectors/utils/createSelectorSyntaxError';
import { resolveSelectorScopeTarget } from '@/polyfills/selectors/utils/resolveSelectorScopeTarget';

export const createSelectorMatcherResolver = ({
  resolveActiveElement,
}: {
  resolveActiveElement: () => object | null;
}): SelectorMatcherResolver => {
  const pseudoClassMatchers = buildSelectorPseudoClassMatchers({
    resolveActiveElement,
  });
  const unscopedMatcherBySelectorsText = new Map<string, SelectorMatcher>();

  const compileSelectorsText = ({
    selectorsText,
    scopeTarget,
  }: {
    selectorsText: string;
    scopeTarget?: SelectorElementLike;
  }): SelectorMatcher => {
    try {
      return compile(
        selectorsText,
        {
          adapter: WORKER_DOM_CSS_SELECT_ADAPTER,
          pseudos: pseudoClassMatchers,
          relativeSelector: false,
          // Compiled matchers are reused across DOM mutations.
          cacheResults: false,
        },
        scopeTarget,
      );
    } catch {
      throw createSelectorSyntaxError(selectorsText);
    }
  };

  const resolveUnscopedMatcher = (selectorsText: string): SelectorMatcher => {
    const cachedMatcher = unscopedMatcherBySelectorsText.get(selectorsText);

    if (isDefined(cachedMatcher)) {
      return cachedMatcher;
    }

    const matcher = compileSelectorsText({ selectorsText });

    if (unscopedMatcherBySelectorsText.size >= SELECTOR_MATCHER_CACHE_SIZE) {
      const oldestSelectorsText = unscopedMatcherBySelectorsText
        .keys()
        .next().value;

      if (isDefined(oldestSelectorsText)) {
        unscopedMatcherBySelectorsText.delete(oldestSelectorsText);
      }
    }

    unscopedMatcherBySelectorsText.set(selectorsText, matcher);

    return matcher;
  };

  return {
    // css-select binds :scope to the element given at compile time, so
    // selectors using it are compiled for each call instead of cached.
    resolveSelectorMatcher: ({ selectorsText, scopeElement }) =>
      SCOPE_PSEUDO_CLASS_PATTERN.test(selectorsText)
        ? compileSelectorsText({
            selectorsText,
            scopeTarget: resolveSelectorScopeTarget(scopeElement),
          })
        : resolveUnscopedMatcher(selectorsText),
  };
};
