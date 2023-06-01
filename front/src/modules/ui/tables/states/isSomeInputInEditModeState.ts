import { atom } from 'recoil';

export const isSomeInputInEditModeState = atom<boolean>({
  key: 'ui/table/is-in-edit-mode',
  default: false,
});
