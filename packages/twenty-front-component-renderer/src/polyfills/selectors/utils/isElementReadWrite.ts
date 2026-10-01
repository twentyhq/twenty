import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { hasElementAttributeIgnoringCase } from '@/polyfills/selectors/utils/hasElementAttributeIgnoringCase';
import { isElementContentEditable } from '@/polyfills/selectors/utils/isElementContentEditable';
import { isElementDisabled } from '@/polyfills/selectors/utils/isElementDisabled';
import { resolveHtmlTagNameOfElement } from '@/polyfills/selectors/utils/resolveHtmlTagNameOfElement';
import { resolveInputTypeOfElement } from '@/polyfills/selectors/utils/resolveInputTypeOfElement';

const NON_EDITABLE_INPUT_TYPES = new Set([
  'button',
  'checkbox',
  'color',
  'file',
  'hidden',
  'image',
  'radio',
  'range',
  'reset',
  'submit',
]);

const isEditableFormControl = (element: SelectorElementLike): boolean =>
  !hasElementAttributeIgnoringCase(element, 'readonly') &&
  !isElementDisabled(element);

export const isElementReadWrite = (element: SelectorElementLike): boolean => {
  const tagName = resolveHtmlTagNameOfElement(element);

  if (tagName === 'textarea') {
    return isEditableFormControl(element);
  }

  if (tagName === 'input') {
    return (
      !NON_EDITABLE_INPUT_TYPES.has(resolveInputTypeOfElement(element)) &&
      isEditableFormControl(element)
    );
  }

  return isElementContentEditable(element);
};
