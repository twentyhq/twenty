import { FORM_CONTROL_STATE_SERIALIZED_EVENT_KEYS } from '@/host/events/constants/FormControlStateSerializedEventKeys';
import { type RemoteSerializedEventListener } from '@/host/events/types/RemoteSerializedEventListener';
import { applyEventDispatchProperties } from '@/host/events/utils/applyEventDispatchProperties';
import { resolveNativeHostEvent } from '@/host/events/utils/resolveNativeHostEvent';
import { serializeEvent } from '@/host/events/utils/serializeEvent';
import { type FindRemoteElementIdContainingNode } from '@/host/geometry/types/FindRemoteElementIdContainingNode';

const forwardedBubblingHostEvents = new WeakSet<object>();

const nativeHostEventsWithForwardedFormControlState = new WeakSet<object>();

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

    const nativeHostEvent = resolveNativeHostEvent(hostEvent);

    const serializedEvent = serializeEvent(hostEvent);

    if (nativeHostEventsWithForwardedFormControlState.has(nativeHostEvent)) {
      for (const formControlStateKey of FORM_CONTROL_STATE_SERIALIZED_EVENT_KEYS) {
        delete serializedEvent[formControlStateKey];
      }
    }

    applyEventDispatchProperties({
      serializedEvent,
      hostEvent,
      findRemoteElementIdContainingNode,
    });

    remoteListener(serializedEvent);

    const hasForwardedFormControlState =
      FORM_CONTROL_STATE_SERIALIZED_EVENT_KEYS.some(
        (formControlStateKey) => formControlStateKey in serializedEvent,
      );

    if (hasForwardedFormControlState) {
      nativeHostEventsWithForwardedFormControlState.add(nativeHostEvent);
    }

    if (serializedEvent.bubbles === true) {
      forwardedBubblingHostEvents.add(hostEvent);
    }
  };
