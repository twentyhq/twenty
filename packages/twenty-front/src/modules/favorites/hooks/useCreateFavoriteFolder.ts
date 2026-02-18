import { usePrefetchedNavigationMenuItemsData } from '@/navigation-menu-item/hooks/usePrefetchedNavigationMenuItemsData';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { isDefined } from 'twenty-shared/utils';
import { useCreateNavigationMenuItemMutation } from '~/generated-metadata/graphql';
import { usePrefetchedFavoritesData } from './usePrefetchedFavoritesData';
import { usePrefetchedFavoritesFoldersData } from './usePrefetchedFavoritesFoldersData';

export const useCreateFavoriteFolder = () => {
  const { createOneRecord: createFavoriteFolder } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.FavoriteFolder,
  });

  const { currentWorkspaceMemberId } = usePrefetchedFavoritesData();
  const { favoriteFolders } = usePrefetchedFavoritesFoldersData();
  const { navigationMenuItems } = usePrefetchedNavigationMenuItemsData();

  const [createNavigationMenuItemMutation] =
    useCreateNavigationMenuItemMutation({
      refetchQueries: ['FindManyNavigationMenuItems'],
    });

  const createNewFavoriteFolder = async (name: string): Promise<void> => {
    if (!name || !currentWorkspaceMemberId) {
      return;
    }

    const maxPosition = Math.max(
      ...favoriteFolders.map((folder) => folder.position),
      0,
    );

    await createFavoriteFolder({
      name,
      position: maxPosition + 1,
    });

    const folderNavigationMenuItems = navigationMenuItems.filter(
      (item) =>
        isDefined(item.name) &&
        !item.folderId &&
        !item.targetRecordId &&
        !item.targetObjectMetadataId &&
        !item.viewId &&
        item.userWorkspaceId === currentWorkspaceMemberId,
    );

    const maxNavigationMenuItemPosition = Math.max(
      ...folderNavigationMenuItems.map((item) => item.position),
      0,
    );

    await createNavigationMenuItemMutation({
      variables: {
        input: {
          name,
          targetRecordId: null,
          targetObjectMetadataId: null,
          userWorkspaceId: currentWorkspaceMemberId,
          folderId: null,
          position: maxNavigationMenuItemPosition + 1,
        },
      },
    });
  };

  return { createNewFavoriteFolder };
};
