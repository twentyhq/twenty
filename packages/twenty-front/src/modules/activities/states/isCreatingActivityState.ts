import { atom } from 'recoil';

export const isCreatingActivityState = atom<boolean>({
  key: 'isCreatingActivityState',
  default: false,
});
