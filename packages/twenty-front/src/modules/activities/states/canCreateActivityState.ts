import { atom } from 'recoil';

export const canCreateActivityState = atom<boolean>({
  key: 'canCreateActivityState',
  default: false,
});
