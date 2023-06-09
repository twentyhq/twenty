import { atom } from 'recoil';

export const isThemeEnabledState = atom<boolean>({
  key: 'isThemeEnabledState',
  default: true,
});
