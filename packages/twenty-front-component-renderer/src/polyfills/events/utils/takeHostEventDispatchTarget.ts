import { HOST_EVENT_DISPATCH_TARGET_BY_EVENT } from '@/polyfills/events/constants/HostEventDispatchTargetByEvent';

export const takeHostEventDispatchTarget = (
  event: Event,
): EventTarget | undefined => {
  const dispatchTarget = HOST_EVENT_DISPATCH_TARGET_BY_EVENT.get(event);

  HOST_EVENT_DISPATCH_TARGET_BY_EVENT.delete(event);

  return dispatchTarget;
};
