import { HOST_EVENT_DISPATCH_TARGET_BY_EVENT } from '@/polyfills/events/constants/HostEventDispatchTargetByEvent';

export const setHostEventDispatchTarget = ({
  event,
  dispatchTarget,
}: {
  event: Event;
  dispatchTarget: EventTarget;
}): void => {
  HOST_EVENT_DISPATCH_TARGET_BY_EVENT.set(event, dispatchTarget);
};
