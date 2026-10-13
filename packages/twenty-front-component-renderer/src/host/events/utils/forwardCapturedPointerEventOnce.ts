import { type FindRemoteElementIdContainingNode } from '@/host/geometry/types/FindRemoteElementIdContainingNode';

const forwardedNativeEventsByOwner = new WeakMap<
  FindRemoteElementIdContainingNode,
  WeakSet<object>
>();

export const forwardCapturedPointerEventOnce = ({
  nativeHostEvent,
  eventOwner,
  forwardEvent,
}: {
  nativeHostEvent: object;
  eventOwner: FindRemoteElementIdContainingNode;
  forwardEvent: () => void;
}): void => {
  const forwardedNativeEvents =
    forwardedNativeEventsByOwner.get(eventOwner) ?? new WeakSet<object>();

  if (forwardedNativeEvents.has(nativeHostEvent)) {
    return;
  }

  forwardEvent();
  forwardedNativeEvents.add(nativeHostEvent);
  forwardedNativeEventsByOwner.set(eventOwner, forwardedNativeEvents);
};
