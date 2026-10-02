import { HOST_EVENT_DISPATCH_TARGET } from '@/polyfills/events/constants/HostEventDispatchTarget';
import { isDispatchableEventTarget } from '@/polyfills/events/utils/isDispatchableEventTarget';

export const takeHostEventDispatchTarget = (
  event: Event,
): EventTarget | undefined => {
  const dispatchTarget: unknown = Reflect.get(
    event,
    HOST_EVENT_DISPATCH_TARGET,
  );

  Reflect.deleteProperty(event, HOST_EVENT_DISPATCH_TARGET);

  return isDispatchableEventTarget(dispatchTarget) ? dispatchTarget : undefined;
};
