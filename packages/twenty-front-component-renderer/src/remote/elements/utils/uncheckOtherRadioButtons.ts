import { isNonEmptyString } from '@sniptt/guards';

import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { iterateMatchingDescendants } from '@/polyfills/selectors/utils/iterateMatchingDescendants';
import { readElementAttributeIgnoringCase } from '@/polyfills/selectors/utils/readElementAttributeIgnoringCase';
import { resolveFormOwnerElement } from '@/polyfills/selectors/utils/resolveFormOwnerElement';
import { resolveHtmlTagNameOfElement } from '@/polyfills/selectors/utils/resolveHtmlTagNameOfElement';
import { resolveInputTypeOfElement } from '@/polyfills/selectors/utils/resolveInputTypeOfElement';
import { resolveNodeTreeRoot } from '@/polyfills/selectors/utils/resolveNodeTreeRoot';

const isRadioInput = (element: SelectorElementLike): boolean =>
  resolveHtmlTagNameOfElement(element) === 'input' &&
  resolveInputTypeOfElement(element) === 'radio';

export const uncheckOtherRadioButtons = (radio: SelectorElementLike): void => {
  const groupName = readElementAttributeIgnoringCase(radio, 'name');

  if (!isRadioInput(radio) || !isNonEmptyString(groupName)) {
    return;
  }

  const treeRoot = resolveNodeTreeRoot(radio);
  const formOwner = resolveFormOwnerElement({ element: radio, treeRoot });

  for (const otherRadio of iterateMatchingDescendants({
    nodes: [treeRoot],
    isElementMatching: (candidate) =>
      candidate !== radio &&
      isRadioInput(candidate) &&
      readElementAttributeIgnoringCase(candidate, 'name') === groupName &&
      resolveFormOwnerElement({ element: candidate, treeRoot }) === formOwner,
  })) {
    otherRadio.checked = false;
  }
};
