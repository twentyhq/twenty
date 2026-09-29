import { type TextDirection } from 'twenty-shared/translations';

import { NAVIGATION_DRAWER_MODE_ORDER } from '@/navigation/constants/NavigationDrawerModeOrder';
import { type NavigationDrawerModeTransitionDirection } from '@/navigation/types/NavigationDrawerModeTransitionDirection';
import { type NavigationDrawerActiveTab } from '@/ui/navigation/states/navigationDrawerTabs';

type GetNavigationDrawerModeTransitionDirectionParams = {
  previousNavigationDrawerMode: NavigationDrawerActiveTab;
  nextNavigationDrawerMode: NavigationDrawerActiveTab;
  textDirection: TextDirection;
};

export const getNavigationDrawerModeTransitionDirection = ({
  previousNavigationDrawerMode,
  nextNavigationDrawerMode,
  textDirection,
}: GetNavigationDrawerModeTransitionDirectionParams): NavigationDrawerModeTransitionDirection => {
  const isMovingForward =
    NAVIGATION_DRAWER_MODE_ORDER.indexOf(nextNavigationDrawerMode) >
    NAVIGATION_DRAWER_MODE_ORDER.indexOf(previousNavigationDrawerMode);

  const isEnteringFromTheRight =
    textDirection === 'rtl' ? !isMovingForward : isMovingForward;

  return isEnteringFromTheRight ? 1 : -1;
};
