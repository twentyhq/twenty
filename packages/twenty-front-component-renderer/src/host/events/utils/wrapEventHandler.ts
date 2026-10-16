import { isDefined } from 'twenty-shared/utils';

import { CAPTURED_POINTER_EVENT_TYPES } from '@/constants/CapturedPointerEventTypes';
import { FORM_CONTROL_STATE_SERIALIZED_EVENT_KEYS } from '@/host/events/constants/FormControlStateSerializedEventKeys';
import { type RemoteSerializedEventListener } from '@/host/events/types/RemoteSerializedEventListener';
import { applyEventDispatchProperties } from '@/host/events/utils/applyEventDispatchProperties';
import { forwardCapturedPointerEventOnce } from '@/host/events/utils/forwardCapturedPointerEventOnce';
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

    const serializedEvent = serializeEvent(hostEvent, {
      includesFormControlState:
        !nativeHostEventsWithForwardedFormControlState.has(nativeHostEvent),
    });

    applyEventDispatchProperties({
      serializedEvent,
      hostEvent,
      findRemoteElementIdContainingNode,
    });

    const forwardEvent = () => {
      remoteListener(serializedEvent);

      const hasForwardedFormControlState =
        FORM_CONTROL_STATE_SERIALIZED_EVENT_KEYS.some(
          (formControlStateKey) => formControlStateKey in serializedEvent,
        );

      if (hasForwardedFormControlState) {
        nativeHostEventsWithForwardedFormControlState.add(nativeHostEvent);
      }

      if (serializedEvent.bubbles) {
        forwardedBubblingHostEvents.add(hostEvent);
      }
    };

    if (
      serializedEvent.bubbles &&
      CAPTURED_POINTER_EVENT_TYPES.some(
        (capturedEventType) => capturedEventType === serializedEvent.type,
      ) &&
      isDefined(findRemoteElementIdContainingNode)
    ) {
      forwardCapturedPointerEventOnce({
        nativeHostEvent,
        eventOwner: findRemoteElementIdContainingNode,
        forwardEvent,
      });
      return;
    }

    forwardEvent();
  };
