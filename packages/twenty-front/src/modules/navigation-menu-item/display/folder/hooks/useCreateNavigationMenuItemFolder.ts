import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useMutation } from '@apollo/client/react';
import { CreateNavigationMenuItemDocument } from '~/generated-metadata/graphql';

import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';

export const useCreateNavigationMenuItemFolder = () => {
  const { navigationMenuItems, currentWorkspaceMemberId } =
    useNavigationMenuItemsData();

  const [createNavigationMenuItemMutation] = useMutation(
    CreateNavigationMenuItemDocument,
  );

  const createNewNavigationMenuItemFolder = async (
    name: string,
  ): Promise<void> => {
    if (!name || !currentWorkspaceMemberId) {
      return;
    }

    const topLevelItems = navigationMenuItems.filter(
      (item) =>
        !isDefined(item.folderId) &&
        item.userWorkspaceId === currentWorkspaceMemberId,
    );

    const minPosition =
      topLevelItems.length > 0
        ? Math.min(...topLevelItems.map((item) => item.position))
        : 1;

    await createNavigationMenuItemMutation({
      variables: {
        input: {
          type: NavigationMenuItemType.FOLDER,
          name,
          targetRecordId: null,
          targetObjectMetadataId: null,
          userWorkspaceId: currentWorkspaceMemberId,
          folderId: null,
          position: minPosition - 1,
        },
      },
    });
  };

  return { createNewNavigationMenuItemFolder };
};
