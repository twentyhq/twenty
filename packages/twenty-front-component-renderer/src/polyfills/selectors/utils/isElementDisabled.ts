import { isDefined } from 'twenty-shared/utils';

import { isAncestorOrSelfOfNode } from '@/polyfills/dom/utils/isAncestorOrSelfOfNode';
import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { canElementBeDisabled } from '@/polyfills/selectors/utils/canElementBeDisabled';
import { isSelectorElementNode } from '@/polyfills/selectors/utils/isSelectorElementNode';
import { readBooleanControlState } from '@/polyfills/selectors/utils/readBooleanControlState';
import { resolveHtmlTagNameOfElement } from '@/polyfills/selectors/utils/resolveHtmlTagNameOfElement';
import { resolveParentElement } from '@/polyfills/selectors/utils/resolveParentElement';

const TAG_NAMES_DISABLED_BY_ANCESTOR_FIELDSET = new Set([
  'button',
  'fieldset',
  'input',
  'select',
  'textarea',
]);

const hasOwnDisabledState = (element: SelectorElementLike): boolean =>
  readBooleanControlState({ element, propertyName: 'disabled' });

const isInsideFirstLegendOfFieldset = ({
  element,
  fieldset,
}: {
  element: SelectorElementLike;
  fieldset: SelectorElementLike;
}): boolean => {
  const children = fieldset.childNodes ?? [];

  for (let index = 0; index < children.length; index += 1) {
    const child = children[index];

    if (
      isSelectorElementNode(child) &&
      resolveHtmlTagNameOfElement(child) === 'legend'
    ) {
      return isAncestorOrSelfOfNode(child, element);
    }
  }

  return false;
};

export const isElementDisabled = (element: SelectorElementLike): boolean => {
  if (!canElementBeDisabled(element)) {
    return false;
  }

  if (hasOwnDisabledState(element)) {
    return true;
  }

  const tagName = resolveHtmlTagNameOfElement(element);
  let ancestor = resolveParentElement(element);

  if (tagName === 'option') {
    return (
      isDefined(ancestor) &&
      resolveHtmlTagNameOfElement(ancestor) === 'optgroup' &&
      hasOwnDisabledState(ancestor)
    );
  }

  if (!TAG_NAMES_DISABLED_BY_ANCESTOR_FIELDSET.has(tagName)) {
    return false;
  }

  while (isDefined(ancestor)) {
    if (
      resolveHtmlTagNameOfElement(ancestor) === 'fieldset' &&
      hasOwnDisabledState(ancestor) &&
      !isInsideFirstLegendOfFieldset({ element, fieldset: ancestor })
    ) {
      return true;
    }

    ancestor = resolveParentElement(ancestor);
  }

  return false;
};
