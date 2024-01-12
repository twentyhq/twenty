import { atom } from 'recoil';

export const isSignUpDisabledState = atom<boolean>({
  key: 'isSignUpDisabledState',
  default: false,
});
