import { atom } from 'recoil';

export const isRecordTableFetchingMoreDataState = atom<boolean>({
  key: 'isRecordTableFetchingMoreDataState',
  default: true,
});
