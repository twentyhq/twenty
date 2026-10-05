import { type RemoteSerializedEventListener } from '@/host/events/types/RemoteSerializedEventListener';
import { applyEventDispatchProperties } from '@/host/events/utils/applyEventDispatchProperties';
import { serializeEvent } from '@/host/events/utils/serializeEvent';
import { type FindRemoteElementIdContainingNode } from '@/host/geometry/types/FindRemoteElementIdContainingNode';

const forwardedBubblingHostEvents = new WeakSet<object>();

export const wrapEventHandler =
  ({
    remoteListener,
    findRemoteElementIdContainingNode,
  }: {
    remoteListener: RemoteSerializedEventListener;
    findRemoteElementIdContainingNode?: FindRemoteElementIdContainingNode;
  }) =>
  (hostEvent: object): void => {
    if (forwardedBubblingHostEvents.has(hostEvent)) {
      return;
    }

    const serializedEvent = serializeEvent(hostEvent);

    applyEventDispatchProperties({
      serializedEvent,
      hostEvent,
      findRemoteElementIdContainingNode,
    });

    remoteListener(serializedEvent);

    if (serializedEvent.bubbles === true) {
      forwardedBubblingHostEvents.add(hostEvent);
    }
  };
