import { type FavoriteFolder } from '@/favorites/types/FavoriteFolder';
import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const prefetchFavoriteFoldersState = createState<FavoriteFolder[]>({
  key: 'prefetchFavoriteFoldersState',
  defaultValue: [],
});
