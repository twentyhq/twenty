import { atomFamily } from 'recoil';

import { ViewFilterOperand } from '~/generated/graphql';

export const selectedOperandInDropdownScopedState = atomFamily<
  ViewFilterOperand | null,
  string
>({
  key: 'selectedOperandInDropdownScopedState',
  default: null,
});
