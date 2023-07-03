import { atom } from 'recoil';

export const prefillLoginWithSeed = atom<boolean>({
  key: 'prefillLoginWithSeed',
  default: true,
});