import { atom } from 'recoil';

export const numberOfTableRowsState = atom<number>({
  key: 'numberOfTableRowsState',
  default: 0,
});
