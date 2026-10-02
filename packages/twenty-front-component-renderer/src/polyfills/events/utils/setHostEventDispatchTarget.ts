import { HOST_EVENT_DISPATCH_TARGET } from '@/polyfills/events/constants/HostEventDispatchTarget';

export const setHostEventDispatchTarget = ({
  event,
  dispatchTarget,
}: {
  event: Event;
  dispatchTarget: EventTarget;
}): void => {
  Object.defineProperty(event, HOST_EVENT_DISPATCH_TARGET, {
    value: dispatchTarget,
    configurable: true,
  });
};
