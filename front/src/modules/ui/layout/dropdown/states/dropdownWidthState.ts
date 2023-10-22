import { atom } from 'recoil';

export const dropdownWidthState = atom<number | undefined>({
  key: 'dropdownWidthState',
  default: 0,
});
