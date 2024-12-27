import { atom } from 'recoil';

export const openFavoriteFolderIdsState = atom<string[]>({
  key: 'openFavoriteFolderIdsState',
  default: [],
});
