import { atom } from 'recoil';

export const selectFieldSearchFilterScopedState = atom<string>({
  key: 'selectFieldSearchFilterScopedState',
  default: '',
});
