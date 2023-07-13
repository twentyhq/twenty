import { atomFamily } from 'recoil';

import { FilterOperand } from '../types/FilterOperand';

export const selectedOperandInDropdownScopedState = atomFamily<
  FilterOperand | null,
  string
>({
  key: 'selectedOperandInDropdownScopedState',
  default: null,
});
