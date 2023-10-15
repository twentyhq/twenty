import { atom } from 'recoil';

export const isFetchingDataTableDataState = atom<boolean>({
  key: 'isFetchingDataTableDataState',
  default: true,
});
