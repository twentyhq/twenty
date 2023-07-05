import { atomFamily } from 'recoil';

export const filterDropdownSelectedEntityIdScopedState = atomFamily<
  string | null,
  string
>({
  key: 'filterDropdownSelectedEntityIdScopedState',
  default: null,
});
