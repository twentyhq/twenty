import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { isNavigationMenuItemFolder } from '@/navigation-menu-item/common/utils/isNavigationMenuItemFolder';

type FolderWithChildren = {
  id: string;
  navigationMenuItems: NavigationMenuItem[];
};

// Expand a display-ordered top-level list (orphans + folders) into a flat list
// where each folder is immediately followed by its children.
export const flattenNavigationMenuItemsWithFolderChildren = (
  topLevelItems: NavigationMenuItem[],
  foldersWithChildren: FolderWithChildren[],
): NavigationMenuItem[] => {
  const childrenByFolderId = new Map(
    foldersWithChildren.map((folder) => [
      folder.id,
      folder.navigationMenuItems,
    ]),
  );

  return topLevelItems.flatMap((item) =>
    isNavigationMenuItemFolder(item)
      ? [item, ...(childrenByFolderId.get(item.id) ?? [])]
      : [item],
  );
};
