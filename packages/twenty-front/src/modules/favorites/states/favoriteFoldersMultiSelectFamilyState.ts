import { FavoriteFolder } from '@/favorites/types/FavoriteFolder';
import { atomFamily } from 'recoil';

export const favoriteFoldersIdsMultiSelectFamilyState = atomFamily<
  FavoriteFolder[],
  string
>({
  key: 'favoriteFoldersIdsMultiSelectFamilyState',
  default: [],
});
