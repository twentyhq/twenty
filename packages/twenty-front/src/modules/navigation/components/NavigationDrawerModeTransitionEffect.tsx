import { useLingui } from '@lingui/react';
import { useReducedMotion } from 'framer-motion';
import { type RefObject, useLayoutEffect, useState } from 'react';
import { getLocaleTextDirection } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';

import { NAVIGATION_DRAWER_MODE_TRANSITION } from '@/navigation/constants/NavigationDrawerModeTransition';
import { useActiveNavigationDrawerMode } from '@/navigation/hooks/useActiveNavigationDrawerMode';
import { type NavigationDrawerModeTransitionDirection } from '@/navigation/types/NavigationDrawerModeTransitionDirection';
import { getNavigationDrawerModeTransitionDirection } from '@/navigation/utils/getNavigationDrawerModeTransitionDirection';

type NavigationDrawerModeTransitionEffectProps = {
  containerRef: RefObject<HTMLDivElement | null>;
};

export const NavigationDrawerModeTransitionEffect = ({
  containerRef,
}: NavigationDrawerModeTransitionEffectProps) => {
  const activeNavigationDrawerMode = useActiveNavigationDrawerMode();
  const { i18n } = useLingui();
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
        previousNavigationDrawerMode,
        nextNavigationDrawerMode: activeNavigationDrawerMode,
        textDirection: getLocaleTextDirection(i18n.locale),
      }),
    });
  }

  useLayoutEffect(() => {
    const container = containerRef.current;

    if (
      !isDefined(modeTransition) ||
      shouldReduceMotion ||
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
