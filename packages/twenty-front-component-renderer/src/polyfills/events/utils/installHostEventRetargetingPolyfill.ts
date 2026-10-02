import { isDefined } from 'twenty-shared/utils';

import { takeHostEventDispatchTarget } from '@/polyfills/events/utils/takeHostEventDispatchTarget';

export const installHostEventRetargetingPolyfill = (
  elementPrototype: EventTarget,
): void => {
  const dispatchEventAtThisTarget = elementPrototype.dispatchEvent;

  Object.defineProperty(elementPrototype, 'dispatchEvent', {
    value: function (this: EventTarget, event: Event): boolean {
      const hostEventDispatchTarget = takeHostEventDispatchTarget(event);

      if (
        isDefined(hostEventDispatchTarget) &&
        hostEventDispatchTarget !== this
      ) {
        return hostEventDispatchTarget.dispatchEvent(event);
      }

      return dispatchEventAtThisTarget.call(this, event);
    },
    configurable: true,
    writable: true,
  });
};
