import { atom } from 'recoil';

export const tableColumnWidthsState = atom<number[]>({
  key: 'tableColumnWidthsState',
  default: [],
});
