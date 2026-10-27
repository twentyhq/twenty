import { useEffect } from 'react';

import { PRESS_TRANSPORT_FAILURE_WARNING } from '@/host/constants/PressTransportFailureWarning';
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
    let hasWarnedAboutPressPushFailure = false;

    const warnAboutPressPushFailure = () => {
      if (hasWarnedAboutPressPushFailure) {
        return;
      }

      hasWarnedAboutPressPushFailure = true;
      console.warn(PRESS_TRANSPORT_FAILURE_WARNING);
    };

    outsidePressController.setPressEventTransport({
      pushOutsidePressEvent: (eventData) => {
        thread.imports
          .pushOutsidePressEvent(eventData)
          .catch(warnAboutPressPushFailure);
      },
      pushOwnedPressEvent: (eventData) => {
        thread.imports
          .pushOwnedPressEvent(eventData)
          .catch(warnAboutPressPushFailure);
      },
    });

    return () => {
      outsidePressController.reset();
    };
  }, [thread, outsidePressController]);

  return null;
};
