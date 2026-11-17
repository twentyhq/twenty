import { useLingui } from '@lingui/react';
import { useReducedMotion } from 'framer-motion';
import { type RefObject, useLayoutEffect, useState } from 'react';
import { getLocaleTextDirection } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';

import { NAVIGATION_DRAWER_MODE_TRANSITION } from '@/navigation/constants/NavigationDrawerModeTransition';
import { useActiveNavigationDrawerTab } from '@/navigation/hooks/useActiveNavigationDrawerTab';
import { type NavigationDrawerModeTransitionDirection } from '@/navigation/types/NavigationDrawerModeTransitionDirection';
import { getNavigationDrawerModeTransitionDirection } from '@/navigation/utils/getNavigationDrawerModeTransitionDirection';

type NavigationDrawerModeTransitionEffectProps = {
  containerRef: RefObject<HTMLDivElement | null>;
};

export const NavigationDrawerModeTransitionEffect = ({
  containerRef,
}: NavigationDrawerModeTransitionEffectProps) => {
  const activeNavigationDrawerTab = useActiveNavigationDrawerTab();
  const { i18n } = useLingui();
  const shouldReduceMotion = useReducedMotion();

  const [previousNavigationDrawerTab, setPreviousNavigationDrawerTab] =
    useState(activeNavigationDrawerTab);
  const [modeTransition, setModeTransition] = useState<{
    direction: NavigationDrawerModeTransitionDirection;
  } | null>(null);

  if (activeNavigationDrawerTab !== previousNavigationDrawerTab) {
    setPreviousNavigationDrawerTab(activeNavigationDrawerTab);
    setModeTransition(
      shouldReduceMotion
        ? null
        : {
            direction: getNavigationDrawerModeTransitionDirection({
              previousNavigationDrawerMode: previousNavigationDrawerTab,
              nextNavigationDrawerMode: activeNavigationDrawerTab,
              textDirection: getLocaleTextDirection(i18n.locale),
            }),
          },
    );
  }

  useLayoutEffect(() => {
    const container = containerRef.current;

    if (!isDefined(modeTransition) || !isDefined(container)) {
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
  }, [containerRef, modeTransition]);

  return null;
};
