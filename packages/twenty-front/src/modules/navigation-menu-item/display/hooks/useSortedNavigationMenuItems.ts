import { useCallback, useMemo } from 'react';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { filterAndSortNavigationMenuItems } from '@/navigation-menu-item/common/utils/filterAndSortNavigationMenuItems';
import { filterReadableNavigationMenuItems } from '@/navigation-menu-item/common/utils/filterReadableNavigationMenuItems';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

import { useNavigationMenuItemsData } from './useNavigationMenuItemsData';

export const useSortedNavigationMenuItems = () => {
  const { navigationMenuItems, workspaceNavigationMenuItems } =
    useNavigationMenuItemsData();
  const views = useAtomStateValue(viewsSelector);
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );

  const filterReadableUnlessCustomizing = useCallback(
    (sortedItems: NavigationMenuItem[]) =>
      isLayoutCustomizationModeEnabled
        ? sortedItems
        : filterReadableNavigationMenuItems({
            navigationMenuItems: sortedItems,
            objectMetadataItems,
            views,
            objectPermissionsByObjectMetadataId,
          }),
    [
      isLayoutCustomizationModeEnabled,
      objectMetadataItems,
      views,
      objectPermissionsByObjectMetadataId,
    ],
  );

  const navigationMenuItemsSorted = useMemo(
    () =>
      filterReadableUnlessCustomizing(
        filterAndSortNavigationMenuItems(
          navigationMenuItems,
          views,
          objectMetadataItems,
        ),
      ),
    [
      navigationMenuItems,
      views,
      objectMetadataItems,
      filterReadableUnlessCustomizing,
    ],
  );

  const workspaceNavigationMenuItemsSorted = useMemo(
    () =>
      filterReadableUnlessCustomizing(
        filterAndSortNavigationMenuItems(
          workspaceNavigationMenuItems,
          views,
          objectMetadataItems,
        ),
      ),
    [
      workspaceNavigationMenuItems,
      views,
      objectMetadataItems,
      filterReadableUnlessCustomizing,
    ],
  );

  return {
    navigationMenuItemsSorted,
    workspaceNavigationMenuItemsSorted,
  };
};
