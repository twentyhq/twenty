import { atom } from 'recoil';

export const contextMenuIsOpenState = atom<boolean>({
  key: 'contextMenuIsOpenState',
  default: false,
});
