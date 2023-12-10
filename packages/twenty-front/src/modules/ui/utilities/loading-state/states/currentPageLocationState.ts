import { atom } from 'recoil';

export const currentPageLocationState = atom<string>({
  key: 'currentPageLocationState',
  default: '',
});
