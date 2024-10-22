import { atomFamily } from 'recoil';

export const favoriteFoldersMultiSelectCheckedFamilyState = atomFamily<
  string[],
  string
>({
  key: 'favoriteFoldersMultiSelectCheckedFamilyState',
  default: [],
});
