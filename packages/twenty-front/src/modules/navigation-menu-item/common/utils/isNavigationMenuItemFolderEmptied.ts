import { type NavigationMenuItem } from '~/generated-metadata/graphql';

// True when a folder had children but none of them survive filtering for this
// viewer — it would otherwise render as a row that opens onto nothing.
//
// A folder with no children at all is left alone: that is an empty folder
// somebody made on purpose, not one emptied by permissions.
export const isNavigationMenuItemFolderEmptied = ({
  folderId,
  allItems,
  visibleItems,
}: {
  folderId: string;
  allItems: NavigationMenuItem[];
  visibleItems: NavigationMenuItem[];
}): boolean => {
  const hasAnyChild = allItems.some((item) => item.folderId === folderId);

  if (!hasAnyChild) {
    return false;
  }

  return !visibleItems.some((item) => item.folderId === folderId);
};
