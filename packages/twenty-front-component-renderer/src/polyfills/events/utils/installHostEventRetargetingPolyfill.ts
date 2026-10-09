import { isDefined } from 'twenty-shared/utils';

import { takeHostEventDispatchTarget } from '@/polyfills/events/utils/takeHostEventDispatchTarget';
import { workerFileInputActivation } from '@/polyfills/file-input/states/workerFileInputActivation';

export const installHostEventRetargetingPolyfill = (
  elementPrototype: EventTarget,
): void => {
  const dispatchEventWithoutRetargeting = elementPrototype.dispatchEvent;

  Object.defineProperty(elementPrototype, 'dispatchEvent', {
    value: function (this: EventTarget, event: Event): boolean {
      const hostEventDispatchTarget = takeHostEventDispatchTarget(event);

      if (!isDefined(hostEventDispatchTarget)) {
        return dispatchEventWithoutRetargeting.call(this, event);
      }

      return workerFileInputActivation.dispatch({
        event,
        dispatch: () =>
          hostEventDispatchTarget === this
            ? dispatchEventWithoutRetargeting.call(this, event)
            : hostEventDispatchTarget.dispatchEvent(event),
      });
    },
    configurable: true,
    writable: true,
  });
};
