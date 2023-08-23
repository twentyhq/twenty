import { atomFamily } from 'recoil';

export const isDropdownButtonOpenScopedState = atomFamily<boolean, string>({
  key: 'isDropdownButtonOpenScopedState',
  default: false,
});
