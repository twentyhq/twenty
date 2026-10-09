import { callRemoteElementMethod } from '@remote-dom/core/elements';

import { FILE_INPUT_PICKER_METHOD } from '@/constants/FileInputPickerMethod';
import { type InputClickActivationContext } from '@/polyfills/dom/types/InputClickActivationContext';

export const runFileInputClickActivation = ({
  inputElement,
  clickEvent,
  dispatchEvent,
}: InputClickActivationContext): boolean => {
  const dispatchResult = dispatchEvent(clickEvent);

  if (clickEvent.defaultPrevented || !inputElement.isConnected) {
    return dispatchResult;
  }

  callRemoteElementMethod(inputElement, FILE_INPUT_PICKER_METHOD);

  return dispatchResult;
};
