import { atom } from 'recoil';

export const isNavigationMenuInEditModeState = atom<boolean>({
  key: 'isNavigationMenuInEditModeState',
  default: false,
});
