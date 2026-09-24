import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { findFirstMatchingDescendant } from '@/polyfills/selectors/utils/findFirstMatchingDescendant';
import { isElementChecked } from '@/polyfills/selectors/utils/isElementChecked';
import { readElementAttributeIgnoringCase } from '@/polyfills/selectors/utils/readElementAttributeIgnoringCase';
import { resolveFormOwnerElement } from '@/polyfills/selectors/utils/resolveFormOwnerElement';
import { resolveHtmlTagNameOfElement } from '@/polyfills/selectors/utils/resolveHtmlTagNameOfElement';
import { resolveInputTypeOfElement } from '@/polyfills/selectors/utils/resolveInputTypeOfElement';
import { resolveNodeTreeRoot } from '@/polyfills/selectors/utils/resolveNodeTreeRoot';

const isRadioInput = (element: SelectorElementLike): boolean =>
  resolveHtmlTagNameOfElement(element) === 'input' &&
  resolveInputTypeOfElement(element) === 'radio';

export const isRadioButtonGroupChecked = (
  radio: SelectorElementLike,
): boolean => {
  const groupName = readElementAttributeIgnoringCase(radio, 'name');

  if (!isNonEmptyString(groupName)) {
    return isElementChecked(radio);
  }

  const treeRoot = resolveNodeTreeRoot(radio);
  const formOwner = resolveFormOwnerElement({ element: radio, treeRoot });

  return isDefined(
    findFirstMatchingDescendant({
      nodes: [treeRoot],
      isElementMatching: (candidate) =>
        isRadioInput(candidate) &&
        readElementAttributeIgnoringCase(candidate, 'name') === groupName &&
        resolveFormOwnerElement({ element: candidate, treeRoot }) ===
          formOwner &&
        isElementChecked(candidate),
    }),
  );
};
