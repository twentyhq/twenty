import { isDefined } from 'twenty-shared/utils';
import { useMutation } from '@apollo/client/react';
import { CreateNavigationMenuItemDocument } from '~/generated-metadata/graphql';

import { useNavigationMenuItemsData } from '@/navigation-menu-item/hooks/useNavigationMenuItemsData';

export const useCreateNavigationMenuItemFolder = () => {
  const { navigationMenuItems, currentWorkspaceMemberId } =
    useNavigationMenuItemsData();

  const [createNavigationMenuItemMutation] = useMutation(
    CreateNavigationMenuItemDocument,
    {
      refetchQueries: ['FindManyNavigationMenuItems'],
    },
  );

  const createNewNavigationMenuItemFolder = async (
    name: string,
  ): Promise<void> => {
    if (!name || !currentWorkspaceMemberId) {
      return;
    }

    const folderNavigationMenuItems = navigationMenuItems.filter(
      (item) =>
        isDefined(item.name) &&
        !item.folderId &&
        !item.targetRecordId &&
        !item.targetObjectMetadataId &&
        !item.viewId &&
        item.userWorkspaceId === currentWorkspaceMemberId,
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
