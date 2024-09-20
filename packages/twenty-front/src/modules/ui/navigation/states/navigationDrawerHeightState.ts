import { atom } from 'recoil';

export const navigationDrawerHeightState = atom<number>({
  key: 'navigationDrawerHeight',
  default: 0,
});
