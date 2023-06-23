import { atomFamily } from 'recoil';

export const currentColumnNumberScopedState = atomFamily<number, string>({
  key: 'currentColumnNumberScopedState',
  default: 0,
});
