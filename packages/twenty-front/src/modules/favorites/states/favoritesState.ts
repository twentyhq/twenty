import { Favorite } from '@/favorites/types/Favorite';
import { createState } from '@/ui/utilities/state/utils/createState';

export const favoritesState = createState<Favorite[]>({
  key: 'favoritesState',
  defaultValue: [],
});
