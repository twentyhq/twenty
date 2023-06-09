import { atom } from 'recoil';

export const isAuthenticatingState = atom<boolean>({
  key: 'isAuthenticatingState',
  default: true,
});
