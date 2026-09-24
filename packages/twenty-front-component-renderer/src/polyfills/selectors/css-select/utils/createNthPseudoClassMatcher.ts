import { isDefined } from 'twenty-shared/utils';

import { type CompiledSelectorMatcher } from '@/polyfills/selectors/types/CompiledSelectorMatcher';
import { type NthFormula } from '@/polyfills/selectors/types/NthFormula';
import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { doesPositionMatchNthFormula } from '@/polyfills/selectors/utils/doesPositionMatchNthFormula';
import { resolveHtmlTagNameOfElement } from '@/polyfills/selectors/utils/resolveHtmlTagNameOfElement';
import { resolveNextSiblingElement } from '@/polyfills/selectors/utils/resolveNextSiblingElement';
import { resolvePreviousSiblingElement } from '@/polyfills/selectors/utils/resolvePreviousSiblingElement';

export const createNthPseudoClassMatcher = ({
  nthFormula,
  isCountedFromEnd,
  isOfType,
  ofSelectorMatcher,
}: {
  nthFormula: NthFormula;
  isCountedFromEnd: boolean;
  isOfType: boolean;
  ofSelectorMatcher: CompiledSelectorMatcher | null;
}): CompiledSelectorMatcher => {
  const resolveCountedSiblingElement = isCountedFromEnd
    ? resolveNextSiblingElement
    : resolvePreviousSiblingElement;

  return (element, context) => {
    const elementTagName = resolveHtmlTagNameOfElement(element);
    const isElementCounted = (candidate: SelectorElementLike): boolean =>
      (!isOfType ||
        resolveHtmlTagNameOfElement(candidate) === elementTagName) &&
      (!isDefined(ofSelectorMatcher) || ofSelectorMatcher(candidate, context));

    if (!isElementCounted(element)) {
      return false;
    }

    let position = 1;
    let siblingElement = resolveCountedSiblingElement(element);

    while (isDefined(siblingElement)) {
      if (isElementCounted(siblingElement)) {
        position += 1;
      }

      siblingElement = resolveCountedSiblingElement(siblingElement);
    }

    return doesPositionMatchNthFormula({ position, nthFormula });
  };
};
