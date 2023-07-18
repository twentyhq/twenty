import { atomFamily } from 'recoil';

export const currentRowNumberScopedState = atomFamily<number, string>({
  key: 'currentRowNumberScopedState',
  default: 0,
});
