import { atom } from 'recoil';

export const isRecordTableInitialLoadingState = atom<boolean>({
  key: 'isRecordTableInitialLoadingState',
  default: true,
});
