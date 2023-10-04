import { atomFamily } from 'recoil';

export const filterDropdownSelectedEntityIdsScopedState = atomFamily<
  string[],
  string
>({
  key: 'filterDropdownSelectedEntityIdsScopedState',
  default: [],
});
