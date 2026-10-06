import { useMemo } from 'react';

import { filterAndSortNavigationMenuItems } from '@/navigation-menu-item/common/utils/filterAndSortNavigationMenuItems';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

import { useNavigationMenuItemsData } from './useNavigationMenuItemsData';

export const useSortedNavigationMenuItems = () => {
  const { navigationMenuItems, workspaceNavigationMenuItems } =
    useNavigationMenuItemsData();
  const views = useAtomStateValue(viewsSelector);
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  const navigationMenuItemsSorted = useMemo(() => {
    return filterAndSortNavigationMenuItems(
      navigationMenuItems,
      views,
      objectMetadataItems,
    );
  }, [navigationMenuItems, views, objectMetadataItems]);

  const workspaceNavigationMenuItemsSorted = useMemo(() => {
    return filterAndSortNavigationMenuItems(
      workspaceNavigationMenuItems,
      views,
      objectMetadataItems,
    );
  }, [workspaceNavigationMenuItems, views, objectMetadataItems]);

  return {
    navigationMenuItemsSorted,
    workspaceNavigationMenuItemsSorted,
  };
};
