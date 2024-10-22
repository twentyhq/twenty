import { atomFamily } from 'recoil';

export const favoriteFoldersSearchFilterFamilyState = atomFamily<
  string,
  string
>({
  key: 'favoriteFoldersSearchFilterFamilyState',
  default: '',
});
