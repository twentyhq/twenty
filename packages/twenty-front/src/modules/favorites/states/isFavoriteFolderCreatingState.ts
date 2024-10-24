import { atom } from 'recoil';

export const isFavoriteFolderCreatingState = atom<boolean>({
  key: 'isFavoriteFolderCreatingState',
  default: false,
});
