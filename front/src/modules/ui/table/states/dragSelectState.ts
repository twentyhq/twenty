import { atom } from 'recoil';

export const dragSelectState = atom<boolean>({
  key: 'dragSelectState',
  default: true,
});
