import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useMutation } from '@apollo/client/react';
import { CreateNavigationMenuItemDocument } from '~/generated-metadata/graphql';

import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

export const useCreateNavigationMenuItem = () => {
  const { navigationMenuItems, currentWorkspaceMemberId } =
    useNavigationMenuItemsData();
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  const [createNavigationMenuItemMutation] = useMutation(
    CreateNavigationMenuItemDocument,
    {
      refetchQueries: ['FindManyNavigationMenuItems'],
    },
  );

  const createNavigationMenuItem = async (
    targetRecord: ObjectRecord,
    targetObjectNameSingular: string,
    folderId?: string,
  ) => {
    const isView = targetObjectNameSingular === 'view';

    if (isView) {
      const relevantItems = folderId
        ? navigationMenuItems.filter((item) => item.folderId === folderId)
        : navigationMenuItems.filter(
            (item) =>
              !isDefined(item.folderId) && isDefined(item.userWorkspaceId),
          );

      const maxPosition = Math.max(
        ...relevantItems.map((item) => item.position),
        0,
      );

      await createNavigationMenuItemMutation({
        variables: {
          input: {
            type: NavigationMenuItemType.VIEW,
            viewId: targetRecord.id,
            userWorkspaceId: currentWorkspaceMemberId,
            folderId,
            position: maxPosition + 1,
          },
        },
      });
    } else {
      const objectMetadataItem = objectMetadataItems.find(
        (item) => item.nameSingular === targetObjectNameSingular,
      );

      if (!isDefined(objectMetadataItem)) {
        throw new Error(
          `Object metadata item not found for nameSingular: ${targetObjectNameSingular}`,
        );
      }

      const relevantItems = folderId
        ? navigationMenuItems.filter((item) => item.folderId === folderId)
        : navigationMenuItems.filter(
            (item) =>
              !isDefined(item.folderId) && isDefined(item.userWorkspaceId),
          );

      const maxPosition = Math.max(
        ...relevantItems.map((item) => item.position),
        0,
      );

      await createNavigationMenuItemMutation({
        variables: {
          input: {
            type: NavigationMenuItemType.RECORD,
            targetRecordId: targetRecord.id,
            targetObjectMetadataId: objectMetadataItem.id,
            userWorkspaceId: currentWorkspaceMemberId,
            folderId,
            position: maxPosition + 1,
          },
        },
      });
    }
  };

  return { createNavigationMenuItem };
};
