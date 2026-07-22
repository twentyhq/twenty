import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { MOBILE_VIEWPORT } from 'twenty-ui/theme-constants';

import { WELCOME_TITLE_HANDOFF_TARGET_ELEMENT_ID } from '@/onboarding/constants/WelcomeTitleHandoffTargetElementId';
import { isWelcomeAnimationLeavingState } from '@/onboarding/states/isWelcomeAnimationLeavingState';
import { welcomeTitleFlightState } from '@/onboarding/states/welcomeTitleFlightState';
import { measureWelcomeTitleFlight } from '@/onboarding/utils/measureWelcomeTitleFlight';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

const WELCOME_HOLD_MIN_DURATION_MS = 2900;
const WELCOME_HOLD_MAX_DURATION_MS = 5000;

export const WelcomeAnimationAutoLeaveEffect = () => {
  const setIsWelcomeAnimationLeaving = useSetAtomState(
    isWelcomeAnimationLeavingState,
  );
  const setWelcomeTitleFlight = useSetAtomState(welcomeTitleFlightState);

  useEffect(() => {
    let hasFired = false;

    const leave = () => {
      if (hasFired) {
        return;
      }
      hasFired = true;

      const canTitleFlyToChat = window.innerWidth > MOBILE_VIEWPORT;
      setWelcomeTitleFlight(
        canTitleFlyToChat ? measureWelcomeTitleFlight() : null,
      );
      setIsWelcomeAnimationLeaving(true);
    };

    const capTimeoutId = setTimeout(leave, WELCOME_HOLD_MAX_DURATION_MS);
    const minHoldTimeoutId = setTimeout(() => {
      const hasHandoffTarget = isDefined(
        document.getElementById(WELCOME_TITLE_HANDOFF_TARGET_ELEMENT_ID),
      );
      if (!hasHandoffTarget) {
        return;
      }

      if (isDefined(document.fonts)) {
        void document.fonts.ready.then(leave);
      } else {
        leave();
      }
    }, WELCOME_HOLD_MIN_DURATION_MS);

    return () => {
      clearTimeout(capTimeoutId);
      clearTimeout(minHoldTimeoutId);
      hasFired = true;
    };
  }, [setIsWelcomeAnimationLeaving, setWelcomeTitleFlight]);

  return null;
};
