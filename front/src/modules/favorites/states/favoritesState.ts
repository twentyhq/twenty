import { atom } from 'recoil';

import { Favorite } from '@/favorites/types/Favorite';

export const favoritesState = atom<Favorite[]>({
  key: 'favoritesState',
  default: [],
});
