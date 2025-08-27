import { type FavoriteFolder } from '@/favorites/types/FavoriteFolder';
import { createState } from 'twenty-ui/utilities';

export const prefetchFavoriteFoldersState = createState<FavoriteFolder[]>({
  key: 'prefetchFavoriteFoldersState',
  defaultValue: [],
});
