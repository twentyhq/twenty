import { atomFamily } from 'recoil';

export const filterDropdownSearchInputScopedState = atomFamily<string, string>({
  key: 'filterDropdownSearchInputScopedState',
  default: '',
});
