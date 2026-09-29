import { useEffect } from 'react';

import { FOCUS_TRANSPORT_FAILURE_WARNING } from '@/host/constants/FocusTransportFailureWarning';
import { trackHostFocus } from '@/host/focus/utils/trackHostFocus';
import { type GeometryTracker } from '@/host/geometry/types/GeometryTracker';
import { type FrontComponentThread } from '@/types/FrontComponentThread';

type FrontComponentFocusTrackerEffectProps = {
  thread: FrontComponentThread;
  geometryTracker: GeometryTracker;
};

export const FrontComponentFocusTrackerEffect = ({
  thread,
  geometryTracker,
}: FrontComponentFocusTrackerEffectProps) => {
  useEffect(() => {
    let hasWarnedAboutFocusPushFailure = false;

    return trackHostFocus({
      geometryTracker,
      pushFocusUpdate: (update) => {
        thread.imports.pushFocusUpdate(update).catch(() => {
          if (hasWarnedAboutFocusPushFailure) {
            return;
          }

          hasWarnedAboutFocusPushFailure = true;
          console.warn(FOCUS_TRANSPORT_FAILURE_WARNING);
        });
      },
    });
  }, [thread, geometryTracker]);

  return null;
};
