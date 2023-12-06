import { atom } from 'recoil';

export const currentMobileNavigationDrawerState = atom<'main' | 'settings'>({
  key: 'currentMobileNavigationDrawerState',
  default: 'main',
});
