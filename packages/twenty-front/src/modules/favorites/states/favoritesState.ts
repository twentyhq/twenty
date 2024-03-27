import { createState } from 'twenty-ui';

import { Favorite } from '@/favorites/types/Favorite';

export const favoritesState = createState<Favorite[]>({
  key: 'favoritesState',
  defaultValue: [],
});
