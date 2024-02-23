import { atom } from 'recoil';

export const isActivityInCreateModeState = atom<boolean>({
  key: 'isActivityInCreateModeState',
  default: false,
});
