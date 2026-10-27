import { useEffect } from 'react';

import { OUTSIDE_PRESS_TRANSPORT_FAILURE_WARNING } from '@/host/constants/OutsidePressTransportFailureWarning';
import { trackHostOutsidePress } from '@/host/events/utils/trackHostOutsidePress';
import { type HostPointerCaptureController } from '@/host/events/types/HostPointerCaptureController';
import { type GeometryTracker } from '@/host/geometry/types/GeometryTracker';
import { type FrontComponentThread } from '@/types/FrontComponentThread';

type FrontComponentOutsidePressEffectProps = {
  thread: FrontComponentThread;
  geometryTracker: GeometryTracker;
  pointerCaptureController: HostPointerCaptureController;
};

export const FrontComponentOutsidePressEffect = ({
  thread,
  geometryTracker,
  pointerCaptureController,
}: FrontComponentOutsidePressEffectProps) => {
  useEffect(() => {
    let hasWarnedAboutOutsidePressPushFailure = false;

    return trackHostOutsidePress({
      documentTarget: document,
      findRemoteElementIdContainingNode:
        geometryTracker.findRemoteElementIdContainingNode,
      hasActivePointerCaptureForEvent:
        pointerCaptureController.hasActivePointerCaptureForEvent,
      pushOutsidePressEvent: (eventData) => {
        thread.imports.pushOutsidePressEvent(eventData).catch(() => {
          if (hasWarnedAboutOutsidePressPushFailure) {
            return;
          }

          hasWarnedAboutOutsidePressPushFailure = true;
          console.warn(OUTSIDE_PRESS_TRANSPORT_FAILURE_WARNING);
        });
      },
    });
  }, [thread, geometryTracker, pointerCaptureController]);

  return null;
};
