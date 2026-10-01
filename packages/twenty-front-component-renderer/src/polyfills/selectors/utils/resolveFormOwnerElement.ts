import { isDefined } from 'twenty-shared/utils';

import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { findFirstMatchingDescendant } from '@/polyfills/selectors/utils/findFirstMatchingDescendant';
import { readElementAttributeIgnoringCase } from '@/polyfills/selectors/utils/readElementAttributeIgnoringCase';
import { resolveHtmlTagNameOfElement } from '@/polyfills/selectors/utils/resolveHtmlTagNameOfElement';
import { resolveParentElement } from '@/polyfills/selectors/utils/resolveParentElement';

const isFormElement = (element: SelectorElementLike): boolean =>
  resolveHtmlTagNameOfElement(element) === 'form';

export const resolveFormOwnerElement = ({
  element,
  treeRoot,
}: {
  element: SelectorElementLike;
  treeRoot: SelectorElementLike;
}): SelectorElementLike | null => {
  const formId = readElementAttributeIgnoringCase(element, 'form');

  if (isDefined(formId)) {
    return findFirstMatchingDescendant({
      nodes: [treeRoot],
      isElementMatching: (candidate) =>
        isFormElement(candidate) &&
        readElementAttributeIgnoringCase(candidate, 'id') === formId,
    });
  }

  let ancestorElement = resolveParentElement(element);

  while (isDefined(ancestorElement) && !isFormElement(ancestorElement)) {
    ancestorElement = resolveParentElement(ancestorElement);
  }

  return ancestorElement;
};
