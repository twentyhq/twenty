import { isDefined } from 'twenty-shared/utils';

import { FORM_CONTROL_STATE_SERIALIZED_EVENT_KEYS } from '@/host/events/constants/FormControlStateSerializedEventKeys';
import { forwardedBubblingHostEvents } from '@/host/events/states/forwardedBubblingHostEvents';
import { type ClaimPointerEventForwarding } from '@/host/events/types/ClaimPointerEventForwarding';
import { type RemoteSerializedEventListener } from '@/host/events/types/RemoteSerializedEventListener';
import { applyEventDispatchProperties } from '@/host/events/utils/applyEventDispatchProperties';
import { isHostUiEvent } from '@/host/events/utils/isHostUiEvent';
import { resolveNativeHostEvent } from '@/host/events/utils/resolveNativeHostEvent';
import { serializeEvent } from '@/host/events/utils/serializeEvent';
import { type FindRemoteElementIdContainingNode } from '@/host/geometry/types/FindRemoteElementIdContainingNode';

const nativeHostEventsWithForwardedFormControlState = new WeakSet<object>();

export const wrapEventHandler =
  ({
    remoteListener,
    findRemoteElementIdContainingNode,
    claimPointerEventForwarding,
  }: {
    remoteListener: RemoteSerializedEventListener;
    findRemoteElementIdContainingNode?: FindRemoteElementIdContainingNode;
    claimPointerEventForwarding?: ClaimPointerEventForwarding;
  }) =>
  (hostEvent: object): void => {
    if (forwardedBubblingHostEvents.has(hostEvent)) {
      return;
    }

    const nativeHostEvent = resolveNativeHostEvent(hostEvent);

    if (isHostUiEvent(nativeHostEvent)) {
      return;
    }

    if (
      isDefined(claimPointerEventForwarding) &&
      !claimPointerEventForwarding(nativeHostEvent)
    ) {
      return;
    }

    const serializedEvent = serializeEvent(hostEvent, {
      includesFormControlState:
        !nativeHostEventsWithForwardedFormControlState.has(nativeHostEvent),
    });

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

    if (serializedEvent.bubbles) {
      forwardedBubblingHostEvents.add(hostEvent);
    }
  };
