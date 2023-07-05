import { atomFamily } from 'recoil';

import { TableFilterOperand } from '../types/TableFilterOperand';

export const selectedOperandInDropdownScopedState = atomFamily<
  TableFilterOperand | null,
  string
>({
  key: 'selectedOperandInDropdownScopedState',
  default: null,
});
