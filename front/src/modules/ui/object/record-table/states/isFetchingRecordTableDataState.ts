import { atom } from 'recoil';

export const isFetchingRecordTableDataState = atom<boolean>({
  key: 'isFetchingRecordTableDataState',
  default: true,
});
