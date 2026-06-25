import { useMemo } from 'react';

import { useNavigationMenuItemsByFolder } from '@/navigation-menu-item/display/folder/hooks/useNavigationMenuItemsByFolder';
import { useSortedNavigationMenuItems } from '@/navigation-menu-item/display/hooks/useSortedNavigationMenuItems';
import { getReadableFavoriteNavigationMenuItems } from '@/navigation-menu-item/display/sections/favorites/utils/getReadableFavoriteNavigationMenuItems';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';

export const useReadableFavoriteNavigationMenuItems = () => {
  const { navigationMenuItemsSorted } = useSortedNavigationMenuItems();
  const { userNavigationMenuItemsByFolder } = useNavigationMenuItemsByFolder();
  const views = useAtomStateValue(viewsSelector);
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  return useMemo(
    () =>
      getReadableFavoriteNavigationMenuItems({
        navigationMenuItemsSorted,
        userNavigationMenuItemsByFolder,
        objectMetadataItems,
        views,
        objectPermissionsByObjectMetadataId,
      }),
    [
      navigationMenuItemsSorted,
      userNavigationMenuItemsByFolder,
      objectMetadataItems,
      views,
      objectPermissionsByObjectMetadataId,
    ],
  );
};
