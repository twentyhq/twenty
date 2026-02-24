import { type Favorite } from '@/favorites/types/Favorite';
import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const prefetchFavoritesState = createState<Favorite[]>({
  key: 'prefetchFavoritesState',
  defaultValue: [],
});
