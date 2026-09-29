import { type NavigationDrawerModeTransitionDirection } from '@/navigation/types/NavigationDrawerModeTransitionDirection';
import { type NavigationDrawerActiveTab } from '@/ui/navigation/states/navigationDrawerTabs';

type GetNavigationDrawerModeTransitionDirectionParams = {
  orderedNavigationDrawerModes: NavigationDrawerActiveTab[];
  previousNavigationDrawerMode: NavigationDrawerActiveTab;
  nextNavigationDrawerMode: NavigationDrawerActiveTab;
};

export const getNavigationDrawerModeTransitionDirection = ({
  orderedNavigationDrawerModes,
  previousNavigationDrawerMode,
  nextNavigationDrawerMode,
}: GetNavigationDrawerModeTransitionDirectionParams): NavigationDrawerModeTransitionDirection =>
  orderedNavigationDrawerModes.indexOf(nextNavigationDrawerMode) >
  orderedNavigationDrawerModes.indexOf(previousNavigationDrawerMode)
    ? 1
    : -1;
