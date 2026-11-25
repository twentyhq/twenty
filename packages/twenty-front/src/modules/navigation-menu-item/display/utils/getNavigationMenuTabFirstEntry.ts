import { isNonEmptyString } from '@sniptt/guards';
import { type PermissionFlagType } from 'twenty-shared/constants';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { type NavigationMenuTabEntry } from '@/navigation-menu-item/common/types/NavigationMenuTabEntry';
import { flattenNavigationMenuItemsWithFolderChildren } from '@/navigation-menu-item/common/utils/flattenNavigationMenuItemsWithFolderChildren';
import { getNavigationMenuContainersInDisplayOrder } from '@/navigation-menu-item/common/utils/getNavigationMenuContainersInDisplayOrder';
import { isNavigationMenuItemReadable } from '@/navigation-menu-item/common/utils/isNavigationMenuItemReadable';
import { sortNavigationMenuContainerChildren } from '@/navigation-menu-item/common/utils/sortNavigationMenuContainerChildren';
import { getNavigationMenuItemComputedLink } from '@/navigation-menu-item/display/utils/getNavigationMenuItemComputedLink';
import { getWorkspaceSidebarOrphanItemsInDisplayOrder } from '@/navigation-menu-item/display/utils/getWorkspaceSidebarOrphanItemsInDisplayOrder';

type FoldersWithChildren = Parameters<
  typeof flattenNavigationMenuItemsWithFolderChildren
>[1];

type GetNavigationMenuTabFirstEntryArgs = Pick<
  Parameters<typeof getWorkspaceSidebarOrphanItemsInDisplayOrder>[0],
  | 'workspaceNavigationMenuItems'
  | 'workspaceNavigationMenuItemsSorted'
  | 'objectMetadataItems'
  | 'views'
  | 'objectPermissionsByObjectMetadataId'
> & {
  tabId: string;
  workspaceNavigationMenuItemsByFolder: FoldersWithChildren;
  favoriteNavigationMenuItems: NavigationMenuItem[];
  favoriteNavigationMenuItemsByFolder: FoldersWithChildren;
  permissionFlagMap: Partial<Record<PermissionFlagType, boolean>>;
  getBuiltInSectionEntry: (
    builtInSectionKey: string,
  ) => NavigationMenuTabEntry | null;
};

export const getNavigationMenuTabFirstEntry = ({
  tabId,
  workspaceNavigationMenuItemsByFolder,
  favoriteNavigationMenuItems,
  favoriteNavigationMenuItemsByFolder,
  permissionFlagMap,
  getBuiltInSectionEntry,
  ...orphanItemsArgs
}: GetNavigationMenuTabFirstEntryArgs): NavigationMenuTabEntry | null => {
  const getFirstLinkEntry = ({
    items,
    foldersWithChildren,
  }: {
    items: NavigationMenuItem[];
    foldersWithChildren: FoldersWithChildren;
  }): NavigationMenuTabEntry | null => {
    for (const item of flattenNavigationMenuItemsWithFolderChildren(
      items,
      foldersWithChildren,
    )) {
      if (
        item.type === NavigationMenuItemType.FOLDER ||
        item.type === NavigationMenuItemType.LINK ||
        !isNavigationMenuItemReadable({
          item,
          permissionFlagMap,
          objectMetadataItems: orphanItemsArgs.objectMetadataItems,
          views: orphanItemsArgs.views,
          objectPermissionsByObjectMetadataId:
            orphanItemsArgs.objectPermissionsByObjectMetadataId,
        })
      ) {
        continue;
      }

      const link = getNavigationMenuItemComputedLink({
        item,
        objectMetadataItems: orphanItemsArgs.objectMetadataItems,
        views: orphanItemsArgs.views,
      });

      if (isNonEmptyString(link)) {
        return { type: 'link', link };
      }
    }

    return null;
  };

  const getContainerItems = (containerId: string) =>
    getWorkspaceSidebarOrphanItemsInDisplayOrder({
      ...orphanItemsArgs,
      containerId,
    });

  const getSectionEntry = (
    section: NavigationMenuItem,
  ): NavigationMenuTabEntry | null => {
    if (section.builtInSectionKey === 'favorites') {
      return getFirstLinkEntry({
        items: favoriteNavigationMenuItems,
        foldersWithChildren: favoriteNavigationMenuItemsByFolder,
      });
    }

    if (isDefined(section.builtInSectionKey)) {
      return getBuiltInSectionEntry(section.builtInSectionKey);
    }

    return getFirstLinkEntry({
      items: getContainerItems(section.id),
      foldersWithChildren: workspaceNavigationMenuItemsByFolder,
    });
  };

  const tabChildren = sortNavigationMenuContainerChildren({
    items: getContainerItems(tabId),
    sections: getNavigationMenuContainersInDisplayOrder({
      navigationMenuItems: orphanItemsArgs.workspaceNavigationMenuItems,
      type: NavigationMenuItemType.SECTION,
      containerId: tabId,
    }),
  });

  for (const child of tabChildren) {
    const entry =
      child.type === NavigationMenuItemType.SECTION
        ? getSectionEntry(child)
        : getFirstLinkEntry({
            items: [child],
            foldersWithChildren: workspaceNavigationMenuItemsByFolder,
          });

    if (isDefined(entry)) {
      return entry;
    }
  }

  return null;
};
