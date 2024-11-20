import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { usePrefetchedFavoritesData } from './usePrefetchedFavoritesData';
import { usePrefetchedFavoritesFoldersData } from './usePrefetchedFavoritesFoldersData';

export const useCreateFavoriteFolder = () => {
  const { createOneRecord: createFavoriteFolder } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.FavoriteFolder,
  });

  const { currentWorkspaceMemberId } = usePrefetchedFavoritesData();
  const { favoriteFolders } = usePrefetchedFavoritesFoldersData();

  const createNewFavoriteFolder = async (name: string): Promise<void> => {
    if (!name || !currentWorkspaceMemberId) {
      return;
    }

    const maxPosition = Math.max(
      ...favoriteFolders.map((folder) => folder.position),
      0,
    );

    await createFavoriteFolder({
      workspaceMemberId: currentWorkspaceMemberId,
      name,
      position: maxPosition + 1,
    });
  };

  return { createNewFavoriteFolder };
};
