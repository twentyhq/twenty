import { atom } from 'recoil';

export const freePassState = atom<boolean>({
  key: 'freePassState',
  default: false,
});
