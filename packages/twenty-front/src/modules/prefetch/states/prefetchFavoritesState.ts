import { type Favorite } from '@/favorites/types/Favorite';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const prefetchFavoritesState = createAtomState<Favorite[]>({
  key: 'prefetchFavoritesState',
  defaultValue: [],
});
