import { atomFamily } from 'recoil';

export const filterSearchInputScopedState = atomFamily<string, string>({
  key: 'filterSearchInputScopedState',
  default: '',
});
