import { atom } from 'recoil';

import { MOBILE_VIEWPORT } from '@/ui/theme/constants/theme';

const isMobile = window.innerWidth <= MOBILE_VIEWPORT;

export const isNavbarOpenedState = atom({
  key: 'ui/isNavbarOpenedState',
  default: !isMobile,
});
