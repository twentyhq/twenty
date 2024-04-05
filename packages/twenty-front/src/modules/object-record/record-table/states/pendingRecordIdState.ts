import { atom } from 'recoil';

export const pendingRecordIdState = atom<string | null>({
  key: 'pendingRecordIdState',
  default: null,
});
