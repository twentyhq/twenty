import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { usePrefetchedFavoritesData } from './usePrefetchedFavoritesData';

export const useCreateFavorite = () => {
  const { favorites, currentWorkspaceMemberId } = usePrefetchedFavoritesData();
  const { createOneRecord: createOneFavorite } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Favorite,
  });

  const createFavorite = (
    targetRecord: ObjectRecord,
    targetObjectNameSingular: string,
    favoriteFolderId?: string,
  ) => {
    const relevantFavorites = favoriteFolderId
      ? favorites.filter((fav) => fav.favoriteFolderId === favoriteFolderId)
      : favorites.filter(
          (fav) => !fav.favoriteFolderId && fav.workspaceMemberId,
        );

    const maxPosition = Math.max(
      ...relevantFavorites.map((fav) => fav.position),
      0,
    );

    createOneFavorite({
      [targetObjectNameSingular]: targetRecord,
      [`${targetObjectNameSingular}Id`]: targetRecord.id,
      position: maxPosition + 1,
      workspaceMemberId: currentWorkspaceMemberId,
      favoriteFolderId,
    });
  };

  return { createFavorite };
};
