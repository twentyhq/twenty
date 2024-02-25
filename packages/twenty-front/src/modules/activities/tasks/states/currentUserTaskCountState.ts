import { atom } from 'recoil';

export const currentUserDueTaskCountState = atom<number>({
  default: 0,
  key: 'currentUserDueTaskCountState',
});
