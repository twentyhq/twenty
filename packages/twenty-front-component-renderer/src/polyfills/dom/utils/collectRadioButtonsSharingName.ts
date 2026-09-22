import { isNonEmptyString } from '@sniptt/guards';

import { resolveRadioButtonGroupScopeRoot } from '@/polyfills/dom/utils/resolveRadioButtonGroupScopeRoot';
import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { collectMatchingDescendants } from '@/polyfills/selectors/utils/collectMatchingDescendants';
import { readElementAttributeIgnoringCase } from '@/polyfills/selectors/utils/readElementAttributeIgnoringCase';
import { resolveHtmlTagNameOfElement } from '@/polyfills/selectors/utils/resolveHtmlTagNameOfElement';
import { resolveInputTypeOfElement } from '@/polyfills/selectors/utils/resolveInputTypeOfElement';

const isRadioButtonNamed = (
  element: SelectorElementLike,
  name: string,
): boolean =>
  resolveHtmlTagNameOfElement(element) === 'input' &&
  resolveInputTypeOfElement(element) === 'radio' &&
  readElementAttributeIgnoringCase(element, 'name') === name;

export const collectRadioButtonsSharingName = (
  radioButton: SelectorElementLike,
): SelectorElementLike[] => {
  const name = readElementAttributeIgnoringCase(radioButton, 'name');

  if (!isNonEmptyString(name)) {
    return [];
  }

  return collectMatchingDescendants({
    nodes: [resolveRadioButtonGroupScopeRoot(radioButton)],
    isElementMatching: (candidate) =>
      candidate !== radioButton && isRadioButtonNamed(candidate, name),
  });
};
