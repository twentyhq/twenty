import { isDefined } from 'twenty-shared/utils';

import { forwardedBubblingHostEvents } from '@/host/events/states/forwardedBubblingHostEvents';
import { type HostEventDispatchFields } from '@/host/events/types/HostEventDispatchFields';
import { type HostOutsidePressController } from '@/host/events/types/HostOutsidePressController';
import { type HostPointerCaptureController } from '@/host/events/types/HostPointerCaptureController';
import { type PressEventTransport } from '@/host/events/types/PressEventTransport';
import { applyEventDispatchProperties } from '@/host/events/utils/applyEventDispatchProperties';
import { resolveNativeHostEvent } from '@/host/events/utils/resolveNativeHostEvent';
import { serializeEvent } from '@/host/events/utils/serializeEvent';
import { trackHostOutsidePress } from '@/host/events/utils/trackHostOutsidePress';
import { type GeometryTracker } from '@/host/geometry/types/GeometryTracker';

export const createHostOutsidePressController = ({
  geometryTracker,
  pointerCaptureController,
}: {
  geometryTracker: Pick<GeometryTracker, 'findRemoteElementIdContainingNode'>;
  pointerCaptureController: Pick<
    HostPointerCaptureController,
    'claimPointerEventForwarding' | 'hasActivePointerCaptureForEvent'
  >;
}): HostOutsidePressController => {
  let isObservedByWorker = false;
  let pressEventTransport: PressEventTransport | null = null;
  let stopTrackingHostOutsidePress: (() => void) | null = null;

  const syncHostOutsidePressTracking = () => {
    const shouldTrack = isObservedByWorker && isDefined(pressEventTransport);

    if (!shouldTrack) {
      stopTrackingHostOutsidePress?.();
      stopTrackingHostOutsidePress = null;
      return;
    }

    if (isDefined(stopTrackingHostOutsidePress)) {
      return;
    }

    stopTrackingHostOutsidePress = trackHostOutsidePress({
      findRemoteElementIdContainingNode:
        geometryTracker.findRemoteElementIdContainingNode,
      hasActivePointerCaptureForEvent:
        pointerCaptureController.hasActivePointerCaptureForEvent,
      pushOutsidePressEvent: (eventData) =>
        pressEventTransport?.pushOutsidePressEvent(eventData),
    });
  };

  const forwardUnhandledOwnedPress = (hostEvent: HostEventDispatchFields) => {
    if (
      !isObservedByWorker ||
      !isDefined(pressEventTransport) ||
      forwardedBubblingHostEvents.has(hostEvent) ||
      !isDefined(
        geometryTracker.findRemoteElementIdContainingNode(hostEvent.target),
      ) ||
      !pointerCaptureController.claimPointerEventForwarding(
        resolveNativeHostEvent(hostEvent),
      )
    ) {
      return;
    }

    const serializedEvent = serializeEvent(hostEvent, {
      includesFormControlState: false,
    });

    applyEventDispatchProperties({
      serializedEvent,
      hostEvent,
      findRemoteElementIdContainingNode:
        geometryTracker.findRemoteElementIdContainingNode,
    });
    forwardedBubblingHostEvents.add(hostEvent);
    pressEventTransport.pushOwnedPressEvent(serializedEvent);
  };

  return {
    observeOutsidePresses: () => {
      isObservedByWorker = true;
      syncHostOutsidePressTracking();
    },
    unobserveOutsidePresses: () => {
      isObservedByWorker = false;
      syncHostOutsidePressTracking();
    },
    setPressEventTransport: (nextPressEventTransport) => {
      pressEventTransport = nextPressEventTransport;
      syncHostOutsidePressTracking();
    },
    forwardUnhandledOwnedPress,
    reset: () => {
      isObservedByWorker = false;
      pressEventTransport = null;
      syncHostOutsidePressTracking();
    },
  };
};
