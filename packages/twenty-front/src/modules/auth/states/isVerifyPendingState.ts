import { atom } from 'recoil';

export const isVerifyPendingState = atom<boolean>({
  key: 'isVerifyPendingState',
  default: false,
});
