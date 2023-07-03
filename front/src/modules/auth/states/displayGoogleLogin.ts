import { atom } from 'recoil';

export const displayGoogleLogin = atom<boolean>({
  key: 'displayGoogleLogin',
  default: true,
});
