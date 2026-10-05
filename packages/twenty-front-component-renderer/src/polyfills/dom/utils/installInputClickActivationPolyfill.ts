import { isNull } from '@sniptt/guards';

import { type InputClickActivationContext } from '@/polyfills/dom/types/InputClickActivationContext';
import { type NodeWithOwnerDocument } from '@/polyfills/dom/types/NodeWithOwnerDocument';
import { resolveInputClickActivationType } from '@/polyfills/dom/utils/resolveInputClickActivationType';
import { runCheckboxClickActivation } from '@/polyfills/dom/utils/runCheckboxClickActivation';
import { runRadioButtonClickActivation } from '@/polyfills/dom/utils/runRadioButtonClickActivation';
import { isHostOriginatedEvent } from '@/polyfills/events/utils/isHostOriginatedEvent';
import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';

type ActivatableInputElement = EventTarget &
  SelectorElementLike &
  NodeWithOwnerDocument;

export const installInputClickActivationPolyfill = (
  inputElementPrototype: EventTarget,
): void => {
  const dispatchEventWithoutActivation = inputElementPrototype.dispatchEvent;

  Object.defineProperty(inputElementPrototype, 'dispatchEvent', {
    value: function (this: ActivatableInputElement, event: Event): boolean {
      const dispatchEvent = (eventToDispatch: Event): boolean =>
        dispatchEventWithoutActivation.call(this, eventToDispatch);

      const isWorkerOriginatedClick =
        event.type === 'click' && !isHostOriginatedEvent(event);

      if (!isWorkerOriginatedClick) {
        return dispatchEvent(event);
      }

      const activationType = resolveInputClickActivationType(this);

      if (isNull(activationType)) {
        return dispatchEvent(event);
      }

      const clickActivationContext: InputClickActivationContext = {
        inputElement: this,
        clickEvent: event,
        dispatchEvent,
      };

      if (activationType === 'checkbox') {
        return runCheckboxClickActivation(clickActivationContext);
      }

      return runRadioButtonClickActivation(clickActivationContext);
    },
    configurable: true,
    writable: true,
  });
};
