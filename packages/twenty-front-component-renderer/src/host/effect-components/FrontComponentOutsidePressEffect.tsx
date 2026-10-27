import { useEffect } from 'react';

import { OUTSIDE_PRESS_TRANSPORT_FAILURE_WARNING } from '@/host/constants/OutsidePressTransportFailureWarning';
import { type HostOutsidePressController } from '@/host/events/types/HostOutsidePressController';
import { type FrontComponentThread } from '@/types/FrontComponentThread';

type FrontComponentOutsidePressEffectProps = {
  thread: FrontComponentThread;
  outsidePressController: HostOutsidePressController;
};

export const FrontComponentOutsidePressEffect = ({
  thread,
  outsidePressController,
}: FrontComponentOutsidePressEffectProps) => {
  useEffect(() => {
    let hasWarnedAboutOutsidePressPushFailure = false;

    outsidePressController.setPushOutsidePressEvent((eventData) => {
      thread.imports.pushOutsidePressEvent(eventData).catch(() => {
        if (hasWarnedAboutOutsidePressPushFailure) {
          return;
        }

        hasWarnedAboutOutsidePressPushFailure = true;
        console.warn(OUTSIDE_PRESS_TRANSPORT_FAILURE_WARNING);
      });
    });

    return () => {
      outsidePressController.reset();
    };
  }, [thread, outsidePressController]);

  return null;
};
