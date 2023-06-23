import { atom } from 'recoil';

export const numberOfTableColumnsState = atom<number>({
  key: 'numberOfTableColumnsState',
  default: 0,
});
