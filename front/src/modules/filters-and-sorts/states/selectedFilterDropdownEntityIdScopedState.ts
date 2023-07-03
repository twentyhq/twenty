import { atomFamily } from 'recoil';

export const selectedFilterDropdownEntityIdScopedState = atomFamily<
  string | null,
  string
>({
  key: 'selectedFilterDropdownEntityIdScopedState',
  default: null,
});
