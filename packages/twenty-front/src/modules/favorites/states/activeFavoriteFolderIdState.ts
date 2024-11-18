import { atom } from 'recoil';

export const activeFavoriteFolderIdState = atom<string | null>({
  key: 'activeFavoriteFolderIdState',
  default: null,
});
