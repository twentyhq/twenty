import { isNonEmptyString } from '@sniptt/guards';

import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { collectMatchingDescendants } from '@/polyfills/selectors/utils/collectMatchingDescendants';
import { readElementAttributeIgnoringCase } from '@/polyfills/selectors/utils/readElementAttributeIgnoringCase';
import { resolveFormOwnerElement } from '@/polyfills/selectors/utils/resolveFormOwnerElement';
import { resolveHtmlTagNameOfElement } from '@/polyfills/selectors/utils/resolveHtmlTagNameOfElement';
import { resolveInputTypeOfElement } from '@/polyfills/selectors/utils/resolveInputTypeOfElement';
import { resolveNodeTreeRoot } from '@/polyfills/selectors/utils/resolveNodeTreeRoot';

const isRadioButtonNamed = (
  element: SelectorElementLike,
  name: string,
): boolean =>
  resolveHtmlTagNameOfElement(element) === 'input' &&
  resolveInputTypeOfElement(element) === 'radio' &&
  readElementAttributeIgnoringCase(element, 'name') === name;

export const collectOtherRadioButtonGroupMembers = (
  radioButton: SelectorElementLike,
): SelectorElementLike[] => {
  const name = readElementAttributeIgnoringCase(radioButton, 'name');

  if (!isNonEmptyString(name)) {
    return [];
  }

  const treeRoot = resolveNodeTreeRoot(radioButton);
  const formOwner = resolveFormOwnerElement({ element: radioButton, treeRoot });

  return collectMatchingDescendants({
    nodes: [treeRoot],
    isElementMatching: (candidate) =>
      candidate !== radioButton &&
      isRadioButtonNamed(candidate, name) &&
      resolveFormOwnerElement({ element: candidate, treeRoot }) === formOwner,
  });
};
