import { atom } from 'recoil';

export const isFavorited = atom<boolean>({
  key: 'isFavorited',
  default: false,
});
