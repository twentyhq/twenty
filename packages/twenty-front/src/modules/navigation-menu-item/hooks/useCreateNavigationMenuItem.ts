import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useCreateNavigationMenuItemMutation } from '~/generated-metadata/graphql';

import { usePrefetchedNavigationMenuItemsData } from '@/navigation-menu-item/hooks/usePrefetchedNavigationMenuItemsData';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

export const useCreateNavigationMenuItem = () => {
  const { navigationMenuItems, currentWorkspaceMemberId } =
    usePrefetchedNavigationMenuItemsData();
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const [createNavigationMenuItemMutation] =
    useCreateNavigationMenuItemMutation({
      refetchQueries: ['FindManyNavigationMenuItems'],
    });

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
            (item) => !item.folderId && item.userWorkspaceId,
          );

      const maxPosition = Math.max(
        ...relevantItems.map((item) => item.position),
        0,
      );

      await createNavigationMenuItemMutation({
        variables: {
          input: {
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
            (item) => !item.folderId && item.userWorkspaceId,
          );

      const maxPosition = Math.max(
        ...relevantItems.map((item) => item.position),
        0,
      );

      await createNavigationMenuItemMutation({
        variables: {
          input: {
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
