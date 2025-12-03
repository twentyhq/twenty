import { atom } from 'recoil';

export const currentFavoriteFolderIdState = atom<string | null>({
  key: 'currentFavoriteFolderIdState',
  default: null,
});
