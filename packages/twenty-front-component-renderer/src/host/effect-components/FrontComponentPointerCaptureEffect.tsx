import { useEffect } from 'react';

import { POINTER_CAPTURE_TRANSPORT_FAILURE_WARNING } from '@/host/constants/PointerCaptureTransportFailureWarning';
import { type HostPointerCaptureController } from '@/host/events/types/HostPointerCaptureController';
import { type FrontComponentThread } from '@/types/FrontComponentThread';

type FrontComponentPointerCaptureEffectProps = {
  thread: FrontComponentThread;
  pointerCaptureController: HostPointerCaptureController;
};

export const FrontComponentPointerCaptureEffect = ({
  thread,
  pointerCaptureController,
}: FrontComponentPointerCaptureEffectProps) => {
  useEffect(() => {
    let hasWarnedAboutPointerCapturePushFailure = false;

    const warnAboutPointerCapturePushFailure = () => {
      if (hasWarnedAboutPointerCapturePushFailure) {
        return;
      }

      hasWarnedAboutPointerCapturePushFailure = true;
      console.warn(POINTER_CAPTURE_TRANSPORT_FAILURE_WARNING);
    };

    pointerCaptureController.setTransport({
      pushCapturedPointerEvent: (update) => {
        thread.imports
          .pushCapturedPointerEvent(update)
          .catch(warnAboutPointerCapturePushFailure);
      },
      pushPointerCaptureRefusal: (request) => {
        thread.imports
          .pushPointerCaptureRefusal(request)
          .catch(warnAboutPointerCapturePushFailure);
      },
    });

    return () => {
      pointerCaptureController.setTransport(null);
      pointerCaptureController.reset();
    };
  }, [thread, pointerCaptureController]);

  return null;
};
