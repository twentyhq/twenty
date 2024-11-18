import { ProcessedFavorite } from '@/favorites/utils/sortFavorites';

// Todo: we could only path the fullPath here (which is currentViewPath) and then split it in the function
export const isLocationMatchingFavorite = (
  currentPath: string,
  currentViewPath: string,
  favorite: Pick<ProcessedFavorite, 'objectNameSingular' | 'link'>,
) => {
  return favorite.objectNameSingular === 'view'
    ? favorite.link === currentViewPath
    : favorite.link === currentPath;
};
