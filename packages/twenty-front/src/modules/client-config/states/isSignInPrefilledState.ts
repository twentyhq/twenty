import { atom } from 'recoil';

export const isSignInPrefilledState = atom<boolean>({
  key: 'isSignInPrefilledState',
  default: false,
});
