import { atom } from 'recoil';

export const selectedNavigationMenuItemInEditModeState = atom<string | null>({
  key: 'selectedNavigationMenuItemInEditModeState',
  default: null,
});
