import { type FavoriteFolder } from '@/favorites/types/FavoriteFolder';
import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const prefetchFavoriteFoldersState = createStateV2<FavoriteFolder[]>({
  key: 'prefetchFavoriteFoldersState',
  defaultValue: [],
});
