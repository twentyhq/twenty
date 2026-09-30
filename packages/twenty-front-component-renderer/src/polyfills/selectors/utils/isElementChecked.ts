import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { isOptionElementSelected } from '@/polyfills/selectors/utils/isOptionElementSelected';
import { readBooleanControlState } from '@/polyfills/selectors/utils/readBooleanControlState';
import { resolveHtmlTagNameOfElement } from '@/polyfills/selectors/utils/resolveHtmlTagNameOfElement';
import { resolveInputTypeOfElement } from '@/polyfills/selectors/utils/resolveInputTypeOfElement';

const CHECKABLE_INPUT_TYPES = new Set(['checkbox', 'radio']);

export const isElementChecked = (element: SelectorElementLike): boolean => {
  const tagName = resolveHtmlTagNameOfElement(element);

  if (tagName === 'option') {
    return isOptionElementSelected(element);
  }

  return (
    tagName === 'input' &&
    CHECKABLE_INPUT_TYPES.has(resolveInputTypeOfElement(element)) &&
    readBooleanControlState({ element, propertyName: 'checked' })
  );
};
