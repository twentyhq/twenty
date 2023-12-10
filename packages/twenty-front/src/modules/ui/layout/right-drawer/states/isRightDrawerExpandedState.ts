import { atom } from 'recoil';

export const isRightDrawerExpandedState = atom<boolean>({
  key: 'isRightDrawerExpandedState',
  default: false,
});
