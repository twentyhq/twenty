import { type FindRemoteElementIdContainingNode } from '@/host/geometry/types/FindRemoteElementIdContainingNode';
import { applyEventDispatchProperties } from '@/host/events/utils/applyEventDispatchProperties';
import { serializeEvent } from '@/host/events/utils/serializeEvent';
import { type SerializedEventData } from '@/types/SerializedEventData';

const forwardedBubblingHostEvents = new WeakSet<object>();

export const wrapEventHandler =
  ({
    remoteListener,
    findRemoteElementIdContainingNode,
  }: {
    remoteListener: (detail: SerializedEventData) => void;
    findRemoteElementIdContainingNode?: FindRemoteElementIdContainingNode;
  }) =>
  (hostEvent: object): void => {
    if (forwardedBubblingHostEvents.has(hostEvent)) {
      return;
    }

    const serializedEvent = serializeEvent(hostEvent);

    applyEventDispatchProperties({
      serialized: serializedEvent,
      hostEvent,
      findRemoteElementIdContainingNode,
    });

    remoteListener(serializedEvent);

    if (serializedEvent.bubbles === true) {
      forwardedBubblingHostEvents.add(hostEvent);
    }
  };
