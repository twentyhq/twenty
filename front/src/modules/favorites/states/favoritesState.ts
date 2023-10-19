import { atom } from 'recoil';

import { GetFavoritesQuery } from '~/generated/graphql';

export const favoritesState = atom<GetFavoritesQuery['findFavorites']>({
  key: 'favoritesState',
  default: [],
});
