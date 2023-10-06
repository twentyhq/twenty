import { atom } from 'recoil';

export const activeViewBarFilterState = atom<string>({
  key: 'activeViewBarFilterState',
  default: '',
});
