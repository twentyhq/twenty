import { usePrefetchedNavigationMenuItemsData } from '@/navigation-menu-item/hooks/usePrefetchedNavigationMenuItemsData';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/utils/isNavigationMenuItemFolder';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useCreateNavigationMenuItemMutation } from '~/generated-metadata/graphql';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { usePrefetchedFavoritesData } from './usePrefetchedFavoritesData';
import { usePrefetchedFavoritesFoldersData } from './usePrefetchedFavoritesFoldersData';

export const useCreateFavorite = () => {
  const { favorites, currentWorkspaceMemberId } = usePrefetchedFavoritesData();
  const { favoriteFolders } = usePrefetchedFavoritesFoldersData();
  const { navigationMenuItems } = usePrefetchedNavigationMenuItemsData();
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const { createOneRecord: createOneFavorite } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Favorite,
  });

  const [createNavigationMenuItemMutation] =
    useCreateNavigationMenuItemMutation({
      refetchQueries: ['FindManyNavigationMenuItems'],
    });

  const createFavorite = async (
    targetRecord: ObjectRecord,
    targetObjectNameSingular: string,
    favoriteFolderId?: string,
  ) => {
    const relevantFavorites = favoriteFolderId
      ? favorites.filter((fav) => fav.favoriteFolderId === favoriteFolderId)
      : favorites.filter(
          (fav) => !fav.favoriteFolderId && fav.forWorkspaceMemberId,
        );

    const maxPosition = Math.max(
      ...relevantFavorites.map((fav) => fav.position),
      0,
    );

    await createOneFavorite({
      [`${targetObjectNameSingular}Id`]: targetRecord.id,
      position: maxPosition + 1,
      forWorkspaceMemberId: currentWorkspaceMemberId,
      favoriteFolderId,
    });

    let navigationMenuItemFolderId: string | undefined;

    if (isDefined(favoriteFolderId)) {
      const favoriteFolder = favoriteFolders.find(
        (folder) => folder.id === favoriteFolderId,
      );

      if (isDefined(favoriteFolder)) {
        const matchingNavigationMenuItemFolder = navigationMenuItems.find(
          (item) =>
            isNavigationMenuItemFolder(item) &&
            item.name === favoriteFolder.name &&
            item.userWorkspaceId === currentWorkspaceMemberId,
        );

        navigationMenuItemFolderId = matchingNavigationMenuItemFolder?.id;
      }
    }

    const relevantNavigationMenuItems = navigationMenuItemFolderId
      ? navigationMenuItems.filter(
          (item) => item.folderId === navigationMenuItemFolderId,
        )
      : navigationMenuItems.filter(
          (item) =>
            !item.folderId && item.userWorkspaceId === currentWorkspaceMemberId,
        );

    const maxNavigationMenuItemPosition = Math.max(
      ...relevantNavigationMenuItems.map((item) => item.position),
      0,
    );

    const isView = targetObjectNameSingular === 'view';

    if (isView) {
      await createNavigationMenuItemMutation({
        variables: {
          input: {
            viewId: targetRecord.id,
            userWorkspaceId: currentWorkspaceMemberId,
            folderId: navigationMenuItemFolderId,
            position: maxNavigationMenuItemPosition + 1,
          },
        },
      });
    } else {
      const objectMetadataItem = objectMetadataItems.find(
        (item) => item.nameSingular === targetObjectNameSingular,
      );

      if (isDefined(objectMetadataItem)) {
        await createNavigationMenuItemMutation({
          variables: {
            input: {
              targetRecordId: targetRecord.id,
              targetObjectMetadataId: objectMetadataItem.id,
              userWorkspaceId: currentWorkspaceMemberId,
              folderId: navigationMenuItemFolderId,
              position: maxNavigationMenuItemPosition + 1,
            },
          },
        });
      }
    }
  };

  return { createFavorite };
};
