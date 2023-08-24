import { atomFamily } from 'recoil';

export const isDropdownButtonOpenScopedFamilyState = atomFamily<
  boolean,
  string
>({
  key: 'isDropdownButtonOpenScopedState',
  default: false,
});
