import { usePrefetchedNavigationMenuItemsData } from '@/navigation-menu-item/hooks/usePrefetchedNavigationMenuItemsData';
import { useCreateNavigationMenuItemMutation } from '~/generated-metadata/graphql';

export const useCreateNavigationMenuItemFolder = () => {
  const { navigationMenuItems, currentWorkspaceMemberId } =
    usePrefetchedNavigationMenuItemsData();

  const [createNavigationMenuItemMutation] =
    useCreateNavigationMenuItemMutation({
      refetchQueries: ['FindManyNavigationMenuItems'],
    });

  const createNewNavigationMenuItemFolder = async (
    name: string,
  ): Promise<void> => {
    if (!name || !currentWorkspaceMemberId) {
      return;
    }

    const folderNavigationMenuItems = navigationMenuItems.filter(
      (item) =>
        !item.folderId && item.userWorkspaceId === currentWorkspaceMemberId,
    );

    const maxPosition = Math.max(
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
          position: maxPosition + 1,
        },
      },
    });
  };

  return { createNewNavigationMenuItemFolder };
};
