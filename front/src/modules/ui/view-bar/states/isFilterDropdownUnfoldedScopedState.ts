import { atomFamily } from 'recoil';

export const isFilterDropdownUnfoldedScopedState = atomFamily<boolean, string>({
  key: 'isFilterDropdownUnfoldedScopedState',
  default: false,
});
