import { useReducedMotion } from 'framer-motion';
import { type RefObject, useLayoutEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { NAVIGATION_DRAWER_MODE_TRANSITION } from '@/navigation/constants/NavigationDrawerModeTransition';
import { useActiveNavigationDrawerMode } from '@/navigation/hooks/useActiveNavigationDrawerMode';
import { useNavigationDrawerModes } from '@/navigation/hooks/useNavigationDrawerModes';
import { type NavigationDrawerModeTransitionDirection } from '@/navigation/types/NavigationDrawerModeTransitionDirection';
import { getNavigationDrawerModeTransitionDirection } from '@/navigation/utils/getNavigationDrawerModeTransitionDirection';

type NavigationDrawerModeTransitionEffectProps = {
  containerRef: RefObject<HTMLDivElement | null>;
};

export const NavigationDrawerModeTransitionEffect = ({
  containerRef,
}: NavigationDrawerModeTransitionEffectProps) => {
  const activeNavigationDrawerMode = useActiveNavigationDrawerMode();
  const navigationDrawerModes = useNavigationDrawerModes();
  const shouldReduceMotion = useReducedMotion();

  const [previousNavigationDrawerMode, setPreviousNavigationDrawerMode] =
    useState(activeNavigationDrawerMode);
  const [modeTransition, setModeTransition] = useState<{
    direction: NavigationDrawerModeTransitionDirection;
  } | null>(null);

  if (activeNavigationDrawerMode !== previousNavigationDrawerMode) {
    setPreviousNavigationDrawerMode(activeNavigationDrawerMode);
    setModeTransition({
      direction: getNavigationDrawerModeTransitionDirection({
        orderedNavigationDrawerModes: navigationDrawerModes.map(
          ({ mode }) => mode,
        ),
        previousNavigationDrawerMode,
        nextNavigationDrawerMode: activeNavigationDrawerMode,
      }),
    });
  }

  useLayoutEffect(() => {
    const container = containerRef.current;

    if (
      !isDefined(modeTransition) ||
      shouldReduceMotion === true ||
      !isDefined(container)
    ) {
      return;
    }

    const { durationInMs, easing, offsetInPx } =
      NAVIGATION_DRAWER_MODE_TRANSITION;

    const animation = container.animate(
      [
        {
          opacity: 0,
          transform: `translateX(${modeTransition.direction * offsetInPx}px)`,
        },
        { opacity: 1, transform: 'translateX(0)' },
      ],
      { duration: durationInMs, easing },
    );

    return () => animation.cancel();
  }, [containerRef, modeTransition, shouldReduceMotion]);

  return null;
};
