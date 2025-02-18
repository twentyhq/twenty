import { Favorite } from '@/favorites/types/Favorite';
import { createState } from 'twenty-ui';

export const prefetchFavoritesState = createState<Favorite[]>({
  key: 'prefetchFavoritesState',
  defaultValue: [],
});
