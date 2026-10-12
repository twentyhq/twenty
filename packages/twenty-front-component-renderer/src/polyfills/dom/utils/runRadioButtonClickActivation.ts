import { type InputClickActivationContext } from '@/polyfills/dom/types/InputClickActivationContext';
import { collectOtherCheckedRadioButtonsInGroup } from '@/polyfills/dom/utils/collectOtherCheckedRadioButtonsInGroup';
import { dispatchInputAndChangeEvents } from '@/polyfills/dom/utils/dispatchInputAndChangeEvents';
import { isElementChecked } from '@/polyfills/selectors/utils/isElementChecked';

export const runRadioButtonClickActivation = ({
  inputElement,
  clickEvent,
  dispatchEvent,
}: InputClickActivationContext): boolean => {
  if (isElementChecked(inputElement)) {
    return dispatchEvent(clickEvent);
  }

  const previouslyCheckedRadioButtons =
    collectOtherCheckedRadioButtonsInGroup(inputElement);

  inputElement.checked = true;

  for (const radioButton of previouslyCheckedRadioButtons) {
    radioButton.checked = false;
  }

  const dispatchResult = dispatchEvent(clickEvent);

  if (clickEvent.defaultPrevented) {
    inputElement.checked = false;

    for (const radioButton of previouslyCheckedRadioButtons) {
      radioButton.checked = true;
    }

    return dispatchResult;
  }

  dispatchInputAndChangeEvents({ inputElement, dispatchEvent });

  return dispatchResult;
};
