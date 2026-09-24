import { isDefined } from 'twenty-shared/utils';

import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { resolveNextSiblingElement } from '@/polyfills/selectors/utils/resolveNextSiblingElement';

export const collectNextSiblingElements = (
  element: SelectorElementLike,
): SelectorElementLike[] => {
  const nextSiblingElements: SelectorElementLike[] = [];
  let nextSiblingElement = resolveNextSiblingElement(element);

  while (isDefined(nextSiblingElement)) {
    nextSiblingElements.push(nextSiblingElement);
    nextSiblingElement = resolveNextSiblingElement(nextSiblingElement);
  }

  return nextSiblingElements;
};
