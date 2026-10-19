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

    pointerCaptureController.setPushCapturedPointerEvent((update) => {
      thread.imports.pushCapturedPointerEvent(update).catch(() => {
        if (hasWarnedAboutPointerCapturePushFailure) {
          return;
        }

        hasWarnedAboutPointerCapturePushFailure = true;
        console.warn(POINTER_CAPTURE_TRANSPORT_FAILURE_WARNING);
      });
    });

    return () => {
      pointerCaptureController.reset();
    };
  }, [thread, pointerCaptureController]);

  return null;
};
