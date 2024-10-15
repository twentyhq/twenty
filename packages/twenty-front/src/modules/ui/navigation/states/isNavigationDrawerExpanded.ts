import { atom } from 'recoil';
import { MOBILE_VIEWPORT } from 'twenty-ui';

const isMobile = window.innerWidth <= MOBILE_VIEWPORT;

export const isNavigationDrawerExpandedState = atom({
  key: 'isNavigationDrawerExpanded',
  default: !isMobile,
});
