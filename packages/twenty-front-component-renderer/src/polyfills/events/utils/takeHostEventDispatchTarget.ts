import { hostEventDispatchTargetByEvent } from '@/polyfills/events/states/hostEventDispatchTargetByEvent';

export const takeHostEventDispatchTarget = (
  event: Event,
): EventTarget | undefined => {
  const dispatchTarget = hostEventDispatchTargetByEvent.get(event);

  hostEventDispatchTargetByEvent.delete(event);

  return dispatchTarget;
};
