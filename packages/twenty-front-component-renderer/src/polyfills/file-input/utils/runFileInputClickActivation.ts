import { callRemoteElementMethod } from '@remote-dom/core/elements';
import { isDefined } from 'twenty-shared/utils';

import { FILE_INPUT_PICKER_METHOD } from '@/constants/FileInputPickerMethod';
import { type InputClickActivationContext } from '@/polyfills/dom/types/InputClickActivationContext';
import { workerFileInputActivation } from '@/polyfills/file-input/states/workerFileInputActivation';

export const runFileInputClickActivation = ({
  inputElement,
  clickEvent,
  dispatchEvent,
}: InputClickActivationContext): boolean => {
  const activationId = workerFileInputActivation.takeActivationId();
  const dispatchResult = dispatchEvent(clickEvent);

  if (
    clickEvent.defaultPrevented ||
    !inputElement.isConnected ||
    !isDefined(activationId)
  ) {
    return dispatchResult;
  }

  callRemoteElementMethod(inputElement, FILE_INPUT_PICKER_METHOD, activationId);

  return dispatchResult;
};
