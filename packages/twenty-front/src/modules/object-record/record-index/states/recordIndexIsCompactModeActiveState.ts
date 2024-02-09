import { atom } from 'recoil';

export const recordIndexIsCompactModeActiveState = atom<boolean>({
  key: 'recordIndexIsCompactModeActiveState',
  default: false,
});
