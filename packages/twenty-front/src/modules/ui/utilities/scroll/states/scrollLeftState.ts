import { atom } from 'recoil';

export const scrollLeftState = atom<number>({
  key: 'scroll/scrollLeftState',
  default: 0,
});
