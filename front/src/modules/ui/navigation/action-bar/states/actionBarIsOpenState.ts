import { atom } from 'recoil';

export const actionBarOpenState = atom<boolean>({
  key: 'actionBarOpenState',
  default: false,
});
