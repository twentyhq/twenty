import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { isElementDisabled } from '@/polyfills/selectors/utils/isElementDisabled';
import { resolveInputTypeOfElement } from '@/polyfills/selectors/utils/resolveInputTypeOfElement';

export const resolveInputClickActivationType = (
  inputElement: SelectorElementLike,
): 'checkbox' | 'radio' | 'file' | null => {
  if (isElementDisabled(inputElement)) {
    return null;
  }

  const inputType = resolveInputTypeOfElement(inputElement);
  const hasClickActivationBehavior =
    inputType === 'checkbox' || inputType === 'radio' || inputType === 'file';

  return hasClickActivationBehavior ? inputType : null;
};
