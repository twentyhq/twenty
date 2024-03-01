import { atom } from 'recoil';

import { MOBILE_VIEWPORT } from '@/ui/theme/constants/MobileViewport';

const isMobile = window.innerWidth <= MOBILE_VIEWPORT;

export const isNavigationDrawerOpenState = atom({
  key: 'isNavigationDrawerOpen',
  default: !isMobile,
});
