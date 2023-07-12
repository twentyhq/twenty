import { atom } from 'recoil';

export const isFetchingEntityTableDataState = atom<boolean>({
  key: 'isFetchingEntityTableDataState',
  default: true,
});
