import { type FavoriteFolder } from '@/favorites/types/FavoriteFolder';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const prefetchFavoriteFoldersState = createAtomState<FavoriteFolder[]>({
  key: 'prefetchFavoriteFoldersState',
  defaultValue: [],
});
