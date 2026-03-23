import { isNavigationMenuItemFolder } from '@/navigation-menu-item/common/utils/isNavigationMenuItemFolder';
import { type View } from '@/views/types/View';
import { isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

// Resolve the objectMetadataId for a navigation menu item
const resolveObjectMetadataId = (
  item: NavigationMenuItem,
  views: View[],
): string | null => {
  // View-based items: look up view → objectMetadataId
  if (isDefined(item.viewId)) {
    const view = views.find((v) => v.id === item.viewId);

    return view?.objectMetadataId ?? null;
  }

  // Record-based items: use targetObjectMetadataId directly
  if (isDefined(item.targetObjectMetadataId)) {
    return item.targetObjectMetadataId;
  }

  return null;
};

export const filterNavigationMenuItemsByRole = (
  items: NavigationMenuItem[],
  sidebarPermissions: Map<string, boolean>,
  views: View[],
): NavigationMenuItem[] => {
  // Pre-compute which folder IDs contain at least one visible child
  const visibleFolderIds = new Set<string>();

  for (const item of items) {
    if (!isDefined(item.folderId)) {
      continue;
    }

    const objectMetadataId = resolveObjectMetadataId(item, views);

    if (
      isDefined(objectMetadataId) &&
      sidebarPermissions.get(objectMetadataId) !== false
    ) {
      visibleFolderIds.add(item.folderId);
    }
  }

  return items.filter((item) => {
    // Folders: keep only if at least one child is visible
    if (isNavigationMenuItemFolder(item)) {
      return visibleFolderIds.has(item.id);
    }

    const objectMetadataId = resolveObjectMetadataId(item, views);

    // Links and unresolvable items are always shown
    if (!isDefined(objectMetadataId)) {
      return true;
    }

    // Use the permission value; default to visible if not in the map
    return sidebarPermissions.get(objectMetadataId) !== false;
  });
};
