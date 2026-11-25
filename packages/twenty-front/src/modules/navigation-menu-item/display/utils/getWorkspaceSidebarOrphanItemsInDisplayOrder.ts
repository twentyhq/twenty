import { NavigationMenuItemType } from 'twenty-shared/types';
import {
  canAccessThroughAllRecordsOrRlsPermission,
  isDefined,
} from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { FOLDER_ICON_DEFAULT } from '@/navigation-menu-item/common/constants/FolderIconDefault';
import { isAutomationNavigationMenuItemType } from '@/navigation-menu-item/common/utils/isAutomationNavigationMenuItemType';
import { isNavigationMenuItemTabOrSection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemTabOrSection';
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
  includeInaccessibleObjectBackedItems?: boolean;
  containerId?: string | null;
  shouldIncludeTopLevelItems?: boolean;
};

export const getWorkspaceSidebarOrphanItemsInDisplayOrder = ({
  workspaceNavigationMenuItems,
  workspaceNavigationMenuItemsSorted,
  objectMetadataItems,
  views,
  objectPermissionsByObjectMetadataId,
  includeInaccessibleObjectBackedItems = false,
  containerId = null,
  shouldIncludeTopLevelItems = false,
}: GetWorkspaceSidebarOrphanItemsInDisplayOrderArgs): NavigationMenuItem[] => {
  // TODO(@thomtrp): remove once IS_CUSTOMIZABLE_SIDEBAR_ENABLED is on for every workspace
  const isIncludedTopLevelItem = (item: NavigationMenuItem) =>
    shouldIncludeTopLevelItems && !isDefined(item.parentId);

  const flatWorkspaceItems = workspaceNavigationMenuItems
    .filter(
      (item) =>
        ((item.parentId ?? null) === containerId ||
          isIncludedTopLevelItem(item)) &&
        !isNavigationMenuItemTabOrSection(item),
    )
    .sort((a, b) => a.position - b.position);

  const toContainerItem = (item: NavigationMenuItem): NavigationMenuItem =>
    isIncludedTopLevelItem(item) ? { ...item, parentId: containerId } : item;

  const processedItemsById = new Map(
    workspaceNavigationMenuItemsSorted.map((item) => [item.id, item]),
  );

  return flatWorkspaceItems.reduce<NavigationMenuItem[]>((acc, item) => {
    if (isNavigationMenuItemFolder(item)) {
      acc.push(
        toContainerItem({
          ...item,
          icon: item.icon ?? FOLDER_ICON_DEFAULT,
        }),
      );
    } else {
      const validItem = processedItemsById.get(item.id);
      if (!isDefined(validItem) && !includeInaccessibleObjectBackedItems) {
        return acc;
      }
      const rowSource = isDefined(validItem) ? validItem : item;

      if (
        rowSource.type === NavigationMenuItemType.LINK ||
        rowSource.type === NavigationMenuItemType.PAGE_LAYOUT ||
        rowSource.type === NavigationMenuItemType.NATIVE_PAGE ||
        isAutomationNavigationMenuItemType(rowSource.type)
      ) {
        acc.push(toContainerItem(rowSource));
        return acc;
      }

      const objectMetadataItem = getObjectMetadataForNavigationMenuItem(
        rowSource,
        objectMetadataItems,
        views,
      );

      if (!isDefined(objectMetadataItem)) {
        return acc;
      }

      if (includeInaccessibleObjectBackedItems) {
        acc.push(toContainerItem(rowSource));
        return acc;
      }

      if (
        canAccessThroughAllRecordsOrRlsPermission({
          objectRecordsPermissions: getObjectPermissionsForObject(
            objectPermissionsByObjectMetadataId,
            objectMetadataItem.id,
          ),
          operationType: 'read',
        })
      ) {
        acc.push(toContainerItem(rowSource));
      }
    }
    return acc;
  }, []);
};
