import { atom } from 'recoil';

export const captchaTokenState = atom<string | null>({
  key: 'captchaTokenState',
  default: null,
});
