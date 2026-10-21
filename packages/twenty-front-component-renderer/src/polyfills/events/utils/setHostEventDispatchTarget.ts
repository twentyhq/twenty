import { hostEventDispatchTargetByEvent } from '@/polyfills/events/states/hostEventDispatchTargetByEvent';

export const setHostEventDispatchTarget = ({
  event,
  dispatchTarget,
}: {
  event: Event;
  dispatchTarget: EventTarget;
}): void => {
  hostEventDispatchTargetByEvent.set(event, dispatchTarget);
};
