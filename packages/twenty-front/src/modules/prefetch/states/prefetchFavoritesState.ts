import { type Favorite } from '@/favorites/types/Favorite';
import { createState } from 'twenty-ui/utilities';

export const prefetchFavoritesState = createState<Favorite[]>({
  key: 'prefetchFavoritesState',
  defaultValue: [],
});
