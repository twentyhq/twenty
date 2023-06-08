import { atom } from 'recoil';

export const themeEnabledState = atom<boolean>({
  key: 'ui/theme-enabled',
  default: true,
});
