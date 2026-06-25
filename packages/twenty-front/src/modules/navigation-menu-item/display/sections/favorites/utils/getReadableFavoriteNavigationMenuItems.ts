import { isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { isNavigationMenuItemFolder } from '@/navigation-menu-item/common/utils/isNavigationMenuItemFolder';
import { isNavigationMenuItemReadable } from '@/navigation-menu-item/common/utils/isNavigationMenuItemReadable';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { type ViewWithRelations } from '@/views/types/ViewWithRelations';

type FavoriteFolderWithChildren = {
  id: string;
  navigationMenuItems: NavigationMenuItem[];
};

type GetReadableFavoriteNavigationMenuItemsArgs = {
  navigationMenuItemsSorted: NavigationMenuItem[];
  userNavigationMenuItemsByFolder: FavoriteFolderWithChildren[];
  objectMetadataItems: EnrichedObjectMetadataItem[];
  views: ViewWithRelations[];
  objectPermissionsByObjectMetadataId: Parameters<
    typeof getObjectPermissionsForObject
  >[0];
};

export const getReadableFavoriteNavigationMenuItems = ({
  navigationMenuItemsSorted,
  userNavigationMenuItemsByFolder,
  objectMetadataItems,
  views,
  objectPermissionsByObjectMetadataId,
}: GetReadableFavoriteNavigationMenuItemsArgs): {
  topLevelItems: NavigationMenuItem[];
  folderChildrenById: Map<string, NavigationMenuItem[]>;
} => {
  const isItemReadable = (item: NavigationMenuItem) =>
    isNavigationMenuItemReadable({
      item,
      objectMetadataItems,
      views,
      objectPermissionsByObjectMetadataId,
    });

  const folderChildrenById = new Map<string, NavigationMenuItem[]>();
  for (const folder of userNavigationMenuItemsByFolder) {
    folderChildrenById.set(
      folder.id,
      folder.navigationMenuItems.filter(isItemReadable),
    );
  }

  const topLevelItems = navigationMenuItemsSorted
    .filter((item) => !isDefined(item.folderId))
    .filter((item) =>
      isNavigationMenuItemFolder(item)
        ? (folderChildrenById.get(item.id) ?? []).length > 0
        : isItemReadable(item),
    );

  return { topLevelItems, folderChildrenById };
};
