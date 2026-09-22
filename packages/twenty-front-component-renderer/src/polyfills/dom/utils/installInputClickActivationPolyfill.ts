import { resolveInputClickActivationType } from '@/polyfills/dom/utils/resolveInputClickActivationType';
import { runCheckboxClickActivation } from '@/polyfills/dom/utils/runCheckboxClickActivation';
import { runRadioButtonClickActivation } from '@/polyfills/dom/utils/runRadioButtonClickActivation';
import { isHostOriginatedEvent } from '@/polyfills/events/utils/isHostOriginatedEvent';
import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';

type ActivatableInputElement = EventTarget & SelectorElementLike;

export const installInputClickActivationPolyfill = (
  inputElementPrototype: EventTarget,
): void => {
  const dispatchEventWithoutActivation = inputElementPrototype.dispatchEvent;

  Object.defineProperty(inputElementPrototype, 'dispatchEvent', {
    value: function (this: ActivatableInputElement, event: Event): boolean {
      const dispatchEvent = (eventToDispatch: Event): boolean =>
        dispatchEventWithoutActivation.call(this, eventToDispatch);

      const activationType =
        event.type === 'click' && !isHostOriginatedEvent(event)
          ? resolveInputClickActivationType(this)
          : null;

      if (activationType === 'checkbox') {
        return runCheckboxClickActivation({
          inputElement: this,
          clickEvent: event,
          dispatchEvent,
        });
      }

      if (activationType === 'radio') {
        return runRadioButtonClickActivation({
          inputElement: this,
          clickEvent: event,
          dispatchEvent,
        });
      }

      return dispatchEvent(event);
    },
    configurable: true,
    writable: true,
  });
};
