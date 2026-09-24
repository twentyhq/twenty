import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { hasElementAttributeIgnoringCase } from '@/polyfills/selectors/utils/hasElementAttributeIgnoringCase';
import { isRadioButtonGroupChecked } from '@/polyfills/selectors/utils/isRadioButtonGroupChecked';
import { resolveHtmlTagNameOfElement } from '@/polyfills/selectors/utils/resolveHtmlTagNameOfElement';
import { resolveInputTypeOfElement } from '@/polyfills/selectors/utils/resolveInputTypeOfElement';

export const isElementIndeterminate = (
  element: SelectorElementLike,
): boolean => {
  const tagName = resolveHtmlTagNameOfElement(element);

  if (tagName === 'progress') {
    return !hasElementAttributeIgnoringCase(element, 'value');
  }

  if (tagName !== 'input') {
    return false;
  }

  const inputType = resolveInputTypeOfElement(element);

  if (inputType === 'checkbox') {
    return element.indeterminate === true;
  }

  return inputType === 'radio' && !isRadioButtonGroupChecked(element);
};
