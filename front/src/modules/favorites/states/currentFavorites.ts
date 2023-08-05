import { atom } from 'recoil';

import { GetFavoritesQuery } from '~/generated/graphql';

export const currentFavorites = atom<GetFavoritesQuery['findFavorites'] | []>({
  key: 'favorites',
  default: [],
});
