import { atomFamily } from 'recoil';

export const sortAndFilterBarScopedState = atomFamily<boolean, string>({
  key: 'sortAndFilterBarScopedState',
  default: false,
});
