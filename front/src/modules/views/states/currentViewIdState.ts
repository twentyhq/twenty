import { atom } from 'recoil';

export const currentViewIdState = atom<string | undefined>({
  key: 'currentViewIdState',
  default: undefined,
});
