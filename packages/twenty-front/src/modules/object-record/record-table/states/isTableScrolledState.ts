import { atom } from 'recoil';

export const isTabelScrolledState = atom<boolean>({
  key: 'isTabelScrolledState',
  default: false,
});
