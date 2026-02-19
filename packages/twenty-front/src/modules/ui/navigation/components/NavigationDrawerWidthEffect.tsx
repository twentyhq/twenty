import { useEffect } from 'react';

import {
  NAVIGATION_DRAWER_WIDTH_VAR,
  navigationDrawerWidthState,
} from '@/ui/navigation/states/navigationDrawerWidthState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';

export const NavigationDrawerWidthEffect = () => {
  const navigationDrawerWidth = useRecoilValueV2(navigationDrawerWidthState);

  useEffect(() => {
    document.documentElement.style.setProperty(
      NAVIGATION_DRAWER_WIDTH_VAR,
      `${navigationDrawerWidth}px`,
    );
  }, [navigationDrawerWidth]);

  return null;
};
