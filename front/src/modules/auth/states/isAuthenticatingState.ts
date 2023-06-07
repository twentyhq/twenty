import { atom } from 'recoil';

export const isAuthenticatingState = atom<boolean>({
  key: 'auth/is-authenticating',
  default: true,
});
