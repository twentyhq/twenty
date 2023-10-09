import { atom } from 'recoil';

export const isSomeCellInEditModeState = atom<boolean>({
  key: 'isSomeCellInEditModeState',
  default: false,
});
