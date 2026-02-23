import { type Favorite } from '@/favorites/types/Favorite';
import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const prefetchFavoritesState = createStateV2<Favorite[]>({
  key: 'prefetchFavoritesState',
  defaultValue: [],
});
