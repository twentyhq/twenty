import { atomFamily } from 'recoil';

import { FilterDefinition } from '../types/FilterDefinition';

export const filterDefinitionUsedInDropdownScopedState = atomFamily<
  FilterDefinition | null,
  string
>({
  key: 'filterDefinitionUsedInDropdownScopedState',
  default: null,
});
