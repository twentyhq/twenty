import { atomFamily } from 'recoil';

import { TableFilterDefinition } from '../types/TableFilterDefinition';

export const tableFilterDefinitionUsedInDropdownScopedState = atomFamily<
  TableFilterDefinition | null,
  string
>({
  key: 'tableFilterDefinitionUsedInDropdownScopedState',
  default: null,
});
