import { atom } from 'recoil';

export const selectedTableColumnHeaderState = atom<string>({
  key: 'selectedTableColumnHeader',
  default: '',
});
