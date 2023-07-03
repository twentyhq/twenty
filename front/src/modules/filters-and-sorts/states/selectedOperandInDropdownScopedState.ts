import { atomFamily } from 'recoil';

import { EntityFilterOperand } from '../types/EntityFilterOperand';

export const selectedOperandInDropdownScopedState = atomFamily<
  EntityFilterOperand | null,
  string
>({
  key: 'selectedOperandInDropdownScopedState',
  default: null,
});
