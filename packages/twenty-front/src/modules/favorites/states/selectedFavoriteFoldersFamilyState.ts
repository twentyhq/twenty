import { atomFamily } from 'recoil';

export const selectedFavoriteFoldersFamilyState = atomFamily<string[], string>({
  key: 'selectedFavoriteFoldersFamilyState',
  default: [],
});
