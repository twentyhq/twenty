import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { FOLDER_ICON_DEFAULT } from '@/navigation-menu-item/common/constants/FolderIconDefault';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/common/utils/isNavigationMenuItemFolder';
import { getObjectMetadataForNavigationMenuItem } from '@/navigation-menu-item/display/object/utils/getObjectMetadataForNavigationMenuItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { type ViewWithRelations } from '@/views/types/ViewWithRelations';

type GetWorkspaceSidebarOrphanItemsInDisplayOrderArgs = {
  workspaceNavigationMenuItems: NavigationMenuItem[];
  workspaceNavigationMenuItemsSorted: NavigationMenuItem[];
  objectMetadataItems: EnrichedObjectMetadataItem[];
  views: ViewWithRelations[];
  objectPermissionsByObjectMetadataId: Parameters<
    typeof getObjectPermissionsForObject
  >[0];
};

export const getWorkspaceSidebarOrphanItemsInDisplayOrder = ({
  workspaceNavigationMenuItems,
  workspaceNavigationMenuItemsSorted,
  objectMetadataItems,
  views,
  objectPermissionsByObjectMetadataId,
}: GetWorkspaceSidebarOrphanItemsInDisplayOrderArgs): NavigationMenuItem[] => {
  const flatWorkspaceItems = workspaceNavigationMenuItems
    .filter((item) => !isDefined(item.folderId))
    .sort((a, b) => a.position - b.position);

  const processedItemsById = new Map(
    workspaceNavigationMenuItemsSorted.map((item) => [item.id, item]),
  );

  return flatWorkspaceItems.reduce<NavigationMenuItem[]>((acc, item) => {
    if (isNavigationMenuItemFolder(item)) {
      acc.push({
        ...item,
        icon: item.icon ?? FOLDER_ICON_DEFAULT,
      });
    } else {
      const validItem = processedItemsById.get(item.id);
      if (!isDefined(validItem)) {
        return acc;
      }
      if (validItem.type === NavigationMenuItemType.LINK) {
        acc.push(validItem);
      } else {
        const objectMetadataItem = getObjectMetadataForNavigationMenuItem(
          validItem,
          objectMetadataItems,
          views,
        );
        if (
          isDefined(objectMetadataItem) &&
          getObjectPermissionsForObject(
            objectPermissionsByObjectMetadataId,
            objectMetadataItem.id,
          ).canReadObjectRecords
        ) {
          acc.push(validItem);
        }
      }
    }
    return acc;
  }, []);
};
