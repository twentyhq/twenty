import { createPath } from 'react-router-dom';
import { SidePanelPages } from 'twenty-shared/types';

import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useCurrentSidePanelRoutedLocation = () => {
  const currentNavigationItem = useAtomStateValue(
    sidePanelNavigationStackState,
  ).at(-1);

  return currentNavigationItem?.page === SidePanelPages.RoutedPage
    ? currentNavigationItem.routedLocation
    : null;
};

export const useCurrentSidePanelRoutedPath = () => {
  const location = useCurrentSidePanelRoutedLocation();

  return location === null ? null : createPath(location);
};
