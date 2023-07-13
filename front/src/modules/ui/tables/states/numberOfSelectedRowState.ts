import { atom } from 'recoil';

export const numberOfSelectedRowState = atom<number>({
  key: 'numberOfSelectedRowState',
  default: 0,
});
