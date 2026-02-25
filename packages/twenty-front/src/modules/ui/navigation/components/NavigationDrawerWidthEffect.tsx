import { useEffect } from 'react';

import {
  NAVIGATION_DRAWER_WIDTH_VAR,
  navigationDrawerWidthState,
} from '@/ui/navigation/states/navigationDrawerWidthState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const NavigationDrawerWidthEffect = () => {
  const navigationDrawerWidth = useAtomStateValue(navigationDrawerWidthState);

  useEffect(() => {
    document.documentElement.style.setProperty(
      NAVIGATION_DRAWER_WIDTH_VAR,
      `${navigationDrawerWidth}px`,
    );
  }, [navigationDrawerWidth]);

  return null;
};
