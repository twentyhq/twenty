import { type InputClickActivationContext } from '@/polyfills/dom/types/InputClickActivationContext';
import { dispatchInputAndChangeEvents } from '@/polyfills/dom/utils/dispatchInputAndChangeEvents';
import { isElementChecked } from '@/polyfills/selectors/utils/isElementChecked';

export const runCheckboxClickActivation = ({
  inputElement,
  clickEvent,
  dispatchEvent,
}: InputClickActivationContext): boolean => {
  const checkedBeforeClick = isElementChecked(inputElement);
  const indeterminateBeforeClick = inputElement.indeterminate === true;

  inputElement.checked = !checkedBeforeClick;
  inputElement.indeterminate = false;

  const dispatchResult = dispatchEvent(clickEvent);

  if (clickEvent.defaultPrevented) {
    inputElement.checked = checkedBeforeClick;
    inputElement.indeterminate = indeterminateBeforeClick;

    return dispatchResult;
  }

  dispatchInputAndChangeEvents({ inputElement, dispatchEvent });

  return dispatchResult;
};
