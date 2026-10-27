import { isDefined } from 'twenty-shared/utils';

import { type HostOutsidePressController } from '@/host/events/types/HostOutsidePressController';
import { type HostPointerCaptureController } from '@/host/events/types/HostPointerCaptureController';
import { type PushOutsidePressEvent } from '@/host/events/types/PushOutsidePressEvent';
import { trackHostOutsidePress } from '@/host/events/utils/trackHostOutsidePress';
import { type GeometryTracker } from '@/host/geometry/types/GeometryTracker';

export const createHostOutsidePressController = ({
  geometryTracker,
  pointerCaptureController,
}: {
  geometryTracker: GeometryTracker;
  pointerCaptureController: HostPointerCaptureController;
}): HostOutsidePressController => {
  let isObservedByWorker = false;
  let pushOutsidePressEvent: PushOutsidePressEvent | null = null;
  let stopTrackingHostOutsidePress: (() => void) | null = null;

  const syncHostOutsidePressTracking = () => {
    const shouldTrack = isObservedByWorker && isDefined(pushOutsidePressEvent);

    if (!shouldTrack) {
      stopTrackingHostOutsidePress?.();
      stopTrackingHostOutsidePress = null;
      return;
    }

    if (isDefined(stopTrackingHostOutsidePress)) {
      return;
    }

    stopTrackingHostOutsidePress = trackHostOutsidePress({
      documentTarget: document,
      findRemoteElementIdContainingNode:
        geometryTracker.findRemoteElementIdContainingNode,
      hasActivePointerCaptureForEvent:
        pointerCaptureController.hasActivePointerCaptureForEvent,
      pushOutsidePressEvent: (eventData) => pushOutsidePressEvent?.(eventData),
    });
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
    setPushOutsidePressEvent: (nextPushOutsidePressEvent) => {
      pushOutsidePressEvent = nextPushOutsidePressEvent;
      syncHostOutsidePressTracking();
    },
    reset: () => {
      isObservedByWorker = false;
      pushOutsidePressEvent = null;
      syncHostOutsidePressTracking();
    },
  };
};
