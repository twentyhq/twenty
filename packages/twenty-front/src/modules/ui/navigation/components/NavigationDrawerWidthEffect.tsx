import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import {
  NAVIGATION_DRAWER_WIDTH_VAR,
  navigationDrawerWidthState,
} from '@/ui/navigation/states/navigationDrawerWidthState';

export const NavigationDrawerWidthEffect = () => {
  const navigationDrawerWidth = useRecoilValue(navigationDrawerWidthState);

  useEffect(() => {
    document.documentElement.style.setProperty(
      NAVIGATION_DRAWER_WIDTH_VAR,
      `${navigationDrawerWidth}px`,
    );
  }, [navigationDrawerWidth]);

  return null;
};
