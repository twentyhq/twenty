import { atomFamily } from 'recoil';

export const currentRowScopedState = atomFamily<number, string>({
  key: 'currentRowScopedState',
  default: 0,
});
