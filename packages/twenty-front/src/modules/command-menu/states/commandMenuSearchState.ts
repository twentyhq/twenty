import { atom } from 'recoil';

export const commandMenuSearchState = atom<string>({
  key: 'command-menu/commandMenuSearchState',
  default: '',
});
