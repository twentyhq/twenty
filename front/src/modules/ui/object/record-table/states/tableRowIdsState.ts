import { atom } from 'recoil';

export const tableRowIdsState = atom<string[]>({
  key: 'tableRowIdsState',
  default: [],
});
