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

export function* iterateRadioButtonGroup(
  radio: SelectorElementLike,
): Generator<SelectorElementLike> {
  if (!isRadioInput(radio)) {
    return;
  }

  const groupName = readElementAttributeIgnoringCase(radio, 'name');

  if (!isNonEmptyString(groupName)) {
    yield radio;
    return;
  }

  const treeRoot = resolveNodeTreeRoot(radio);
  const formOwner = resolveFormOwnerElement({ element: radio, treeRoot });

  yield* iterateMatchingDescendants({
    nodes: [treeRoot],
    isElementMatching: (candidate) =>
      isRadioInput(candidate) &&
      readElementAttributeIgnoringCase(candidate, 'name') === groupName &&
      resolveFormOwnerElement({ element: candidate, treeRoot }) === formOwner,
  });
}
