import { atom } from 'recoil';

export const scrollTopState = atom<number>({
  key: 'scroll/scrollTopState',
  default: 0,
});
