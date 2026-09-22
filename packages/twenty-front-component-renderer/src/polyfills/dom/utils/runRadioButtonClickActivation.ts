import { type InputClickActivationContext } from '@/polyfills/dom/types/InputClickActivationContext';
import { collectRadioButtonsSharingName } from '@/polyfills/dom/utils/collectRadioButtonsSharingName';
import { dispatchInputAndChangeEvents } from '@/polyfills/dom/utils/dispatchInputAndChangeEvents';

export const runRadioButtonClickActivation = ({
  inputElement,
  clickEvent,
  dispatchEvent,
}: InputClickActivationContext): boolean => {
  if (inputElement.checked === true) {
    return dispatchEvent(clickEvent);
  }

  const previouslyCheckedRadioButtons = collectRadioButtonsSharingName(
    inputElement,
  ).filter((radioButton) => radioButton.checked === true);

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
