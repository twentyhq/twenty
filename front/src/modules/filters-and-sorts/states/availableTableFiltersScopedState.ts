import { atomFamily } from 'recoil';

import { TableFilterDefinition } from '../types/TableFilterDefinition';

export const availableTableFiltersScopedState = atomFamily<
  TableFilterDefinition[],
  string
>({
  key: 'availableTableFiltersScopedState',
  default: [],
});
