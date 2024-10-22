import { atomFamily } from 'recoil';

export const favoriteFoldersIdsMultiSelectFamilyState = atomFamily<
  string[],
  string
>({
  key: 'favoriteFoldersIdsMultiSelectFamilyState',
  default: [],
});
