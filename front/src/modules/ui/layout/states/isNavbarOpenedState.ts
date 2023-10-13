import { atom } from 'recoil';

import { MOBILE_VIEWPORT } from '@/ui/Themes/theme/constants/theme';

const isMobile = window.innerWidth <= MOBILE_VIEWPORT;

export const isNavbarOpenedState = atom({
  key: 'ui/isNavbarOpenedState',
  default: !isMobile,
});
