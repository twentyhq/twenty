import { atomFamily } from 'recoil';

import { EntityFilter } from '../types/EntityFilter';

export const selectedFilterInDropdownScopedState = atomFamily<
  EntityFilter | null,
  string
>({
  key: 'selectedFilterInDropdownScopedState',
  default: null,
});
