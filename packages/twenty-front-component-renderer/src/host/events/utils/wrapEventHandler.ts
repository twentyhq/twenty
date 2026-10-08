import { FORM_CONTROL_STATE_SERIALIZED_EVENT_KEYS } from '@/host/events/constants/FormControlStateSerializedEventKeys';
import { type RemoteSerializedEventListener } from '@/host/events/types/RemoteSerializedEventListener';
import { applyEventDispatchProperties } from '@/host/events/utils/applyEventDispatchProperties';
import { resolveNativeHostEvent } from '@/host/events/utils/resolveNativeHostEvent';
import { serializeEvent } from '@/host/events/utils/serializeEvent';
import { type FileInputHost } from '@/host/file-input/types/FileInputHost';
import { type FindRemoteElementIdContainingNode } from '@/host/geometry/types/FindRemoteElementIdContainingNode';

const forwardedBubblingHostEvents = new WeakSet<object>();

const nativeHostEventsWithForwardedFormControlState = new WeakSet<object>();

export const wrapEventHandler =
  ({
    remoteListener,
    findRemoteElementIdContainingNode,
    fileInputHost,
  }: {
    remoteListener: RemoteSerializedEventListener;
    findRemoteElementIdContainingNode?: FindRemoteElementIdContainingNode;
    fileInputHost?: FileInputHost | null;
  }) =>
  (hostEvent: object): void => {
    if (forwardedBubblingHostEvents.has(hostEvent)) {
      return;
    }

    const nativeHostEvent = resolveNativeHostEvent(hostEvent);

    const serializedEvent = serializeEvent(hostEvent, {
      includesFormControlState:
        !nativeHostEventsWithForwardedFormControlState.has(nativeHostEvent),
    });

    serializedEvent.fileInputActivationId =
      fileInputHost?.captureActivation(nativeHostEvent);

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
