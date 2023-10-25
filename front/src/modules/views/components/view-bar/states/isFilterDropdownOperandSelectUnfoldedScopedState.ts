import { atomFamily } from 'recoil';

export const isFilterDropdownOperandSelectUnfoldedScopedState = atomFamily<
  boolean,
  string
>({
  key: 'isFilterDropdownOperandSelectUnfoldedScopedState',
  default: false,
});
