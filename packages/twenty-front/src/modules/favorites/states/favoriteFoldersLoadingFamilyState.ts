import { atomFamily } from 'recoil';

export const favoriteFoldersLoadingFamilyState = atomFamily<boolean, string>({
  key: 'favoriteFoldersLoadingFamilyState',
  default: false,
});
