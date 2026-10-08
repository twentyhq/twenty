import { callRemoteElementMethod } from '@remote-dom/core/elements';
import { isDefined } from 'twenty-shared/utils';

import { FILE_INPUT_PICKER_METHOD } from '@/constants/FileInputPickerMethod';
import { createClickEventForElement } from '@/polyfills/dom/utils/createClickEventForElement';
import { type createWorkerFileInputActivation } from '@/polyfills/file-input/utils/createWorkerFileInputActivation';
import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { isElementDisabled } from '@/polyfills/selectors/utils/isElementDisabled';

export const installFileInputActivationPolyfill = ({
  elementPrototype,
  inputElementPrototype,
  activation,
}: {
  elementPrototype: HTMLElement;
  inputElementPrototype: HTMLInputElement;
  activation: ReturnType<typeof createWorkerFileInputActivation>;
}): void => {
  const dispatchEvent = elementPrototype.dispatchEvent;
  const click = inputElementPrototype.click;
  const inputsWithClickInProgress = new WeakSet<HTMLInputElement>();

  Object.defineProperty(elementPrototype, 'dispatchEvent', {
    configurable: true,
    writable: true,
    value: function (this: HTMLElement, event: Event): boolean {
      return activation.dispatch({
        event,
        dispatch: () => dispatchEvent.call(this, event),
      });
    },
  });

  Object.defineProperty(inputElementPrototype, 'click', {
    configurable: true,
    writable: true,
    value: function (this: HTMLInputElement & SelectorElementLike): void {
      if (this.type !== 'file') {
        click.call(this);
        return;
      }

      if (isElementDisabled(this) || inputsWithClickInProgress.has(this)) {
        return;
      }

      inputsWithClickInProgress.add(this);
      const activationId = activation.takeActivationId();

      try {
        const clickEvent = createClickEventForElement(this);
        this.dispatchEvent(clickEvent);

        if (
          !clickEvent.defaultPrevented &&
          this.isConnected &&
          isDefined(activationId)
        ) {
          callRemoteElementMethod(this, FILE_INPUT_PICKER_METHOD, activationId);
        }
      } finally {
        inputsWithClickInProgress.delete(this);
      }
    },
  });
};
