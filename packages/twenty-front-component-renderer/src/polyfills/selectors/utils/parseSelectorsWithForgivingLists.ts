import { isArray } from '@sniptt/guards';
import { compile } from 'css-select';
import { parse, type Selector, SelectorType } from 'css-what';

import { WORKER_DOM_CSS_SELECT_ADAPTER } from '@/polyfills/selectors/constants/WorkerDomCssSelectAdapter';
import { type CssSelectPseudoClassMatchers } from '@/polyfills/selectors/types/CssSelectPseudoClassMatchers';

export const parseSelectorsWithForgivingLists = ({
  selectorsText,
  pseudoClassMatchers,
}: {
  selectorsText: string;
  pseudoClassMatchers: CssSelectPseudoClassMatchers;
}): Selector[][] => {
  const isSupportedBranch = (branch: Selector[]): boolean => {
    try {
      compile(structuredClone([branch]), {
        adapter: WORKER_DOM_CSS_SELECT_ADAPTER,
        pseudos: pseudoClassMatchers,
        relativeSelector: false,
        cacheResults: false,
      });

      return true;
    } catch {
      return false;
    }
  };

  const normalizeSelectorLists = (selectorList: Selector[][]): Selector[][] => {
    for (const branch of selectorList) {
      for (const selector of branch) {
        if (selector.type !== SelectorType.Pseudo || !isArray(selector.data)) {
          continue;
        }

        const nestedSelectorList = normalizeSelectorLists(selector.data);
        const isForgiving = selector.name === 'is' || selector.name === 'where';

        selector.data = isForgiving
          ? nestedSelectorList.filter(isSupportedBranch)
          : nestedSelectorList;
      }
    }

    return selectorList;
  };

  return normalizeSelectorLists(parse(selectorsText));
};
