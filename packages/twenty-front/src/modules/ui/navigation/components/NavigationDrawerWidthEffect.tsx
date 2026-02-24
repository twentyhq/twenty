import { useEffect } from 'react';

import {
  NAVIGATION_DRAWER_WIDTH_VAR,
  navigationDrawerWidthState,
} from '@/ui/navigation/states/navigationDrawerWidthState';
import { useAtomValue } from '@/ui/utilities/state/jotai/hooks/useAtomValue';

export const NavigationDrawerWidthEffect = () => {
  const navigationDrawerWidth = useAtomValue(navigationDrawerWidthState);

  useEffect(() => {
    document.documentElement.style.setProperty(
      NAVIGATION_DRAWER_WIDTH_VAR,
      `${navigationDrawerWidth}px`,
    );
  }, [navigationDrawerWidth]);

  return null;
};
