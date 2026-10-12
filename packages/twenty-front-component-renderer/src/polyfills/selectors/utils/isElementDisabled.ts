import { isDefined } from 'twenty-shared/utils';

import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { canElementBeDisabled } from '@/polyfills/selectors/utils/canElementBeDisabled';
import { isInsideFirstLegendOfFieldset } from '@/polyfills/selectors/utils/isInsideFirstLegendOfFieldset';
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
