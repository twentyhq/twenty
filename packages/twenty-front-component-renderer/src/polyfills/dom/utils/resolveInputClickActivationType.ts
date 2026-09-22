import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { isElementDisabled } from '@/polyfills/selectors/utils/isElementDisabled';
import { resolveInputTypeOfElement } from '@/polyfills/selectors/utils/resolveInputTypeOfElement';

export const resolveInputClickActivationType = (
  inputElement: SelectorElementLike,
): 'checkbox' | 'radio' | null => {
  if (isElementDisabled(inputElement)) {
    return null;
  }

  const inputType = resolveInputTypeOfElement(inputElement);

  return inputType === 'checkbox' || inputType === 'radio' ? inputType : null;
};
