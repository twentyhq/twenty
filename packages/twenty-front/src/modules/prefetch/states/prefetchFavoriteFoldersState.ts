import { FavoriteFolder } from '@/favorites/types/FavoriteFolder';
import { createState } from 'twenty-ui';

export const prefetchFavoriteFoldersState = createState<FavoriteFolder[]>({
  key: 'prefetchFavoriteFoldersState',
  defaultValue: [],
});
