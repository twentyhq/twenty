import { atom } from 'recoil';

export const resizeFieldOffsetState = atom<number>({
  key: 'resizeFieldOffsetState',
  default: 0,
});
