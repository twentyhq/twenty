import { type FindRemoteElementIdContainingNode } from '@/host/geometry/types/FindRemoteElementIdContainingNode';

const forwardedOwnersByNativeEvent = new WeakMap<object, WeakSet<object>>();

export const forwardCapturedPointerEventOnce = ({
  nativeHostEvent,
  eventOwner,
  forwardEvent,
}: {
  nativeHostEvent: object;
  eventOwner: FindRemoteElementIdContainingNode;
  forwardEvent: () => void;
}): void => {
  const forwardedOwners =
    forwardedOwnersByNativeEvent.get(nativeHostEvent) ?? new WeakSet<object>();

  if (forwardedOwners.has(eventOwner)) {
    return;
  }

  forwardEvent();
  forwardedOwners.add(eventOwner);
  forwardedOwnersByNativeEvent.set(nativeHostEvent, forwardedOwners);
};
