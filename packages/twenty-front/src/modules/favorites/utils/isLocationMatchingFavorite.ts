import { ProcessedFavorite } from '@/favorites/utils/sortFavorites';

export const isLocationMatchingFavorite = (
  currentPath: string,
  currentViewPath: string,
  favorite: ProcessedFavorite,
) => {
  return favorite.objectNameSingular === 'view'
    ? favorite.link === currentViewPath
    : favorite.link === currentPath;
};
