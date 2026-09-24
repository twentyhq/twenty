import { isDefined } from 'twenty-shared/utils';

import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { resolveHtmlTagNameOfElement } from '@/polyfills/selectors/utils/resolveHtmlTagNameOfElement';
import { resolveNextSiblingElement } from '@/polyfills/selectors/utils/resolveNextSiblingElement';
import { resolvePreviousSiblingElement } from '@/polyfills/selectors/utils/resolvePreviousSiblingElement';

export const hasSiblingElement = ({
  element,
  direction,
  isOfType,
}: {
  element: SelectorElementLike;
  direction: 'preceding' | 'following';
  isOfType: boolean;
}): boolean => {
  const resolveSiblingElement =
    direction === 'preceding'
      ? resolvePreviousSiblingElement
      : resolveNextSiblingElement;
  const elementTagName = resolveHtmlTagNameOfElement(element);
  let siblingElement = resolveSiblingElement(element);

  while (isDefined(siblingElement)) {
    if (
      !isOfType ||
      resolveHtmlTagNameOfElement(siblingElement) === elementTagName
    ) {
      return true;
    }

    siblingElement = resolveSiblingElement(siblingElement);
  }

  return false;
};
