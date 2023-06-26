import { atom } from 'recoil';

import { MOBILE_VIEWPORT } from '@/ui/themes/themes';

const isMobile = window.innerWidth <= MOBILE_VIEWPORT;

export const isNavbarOpenedState = atom({
  key: 'ui/isNavbarOpenedState',
  default: !isMobile,
});
