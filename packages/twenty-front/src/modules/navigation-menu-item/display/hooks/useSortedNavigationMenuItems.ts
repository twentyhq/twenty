import { useMemo } from 'react';

import { filterAndSortNavigationMenuItems } from '@/navigation-menu-item/common/utils/filterAndSortNavigationMenuItems';
import { useNavigationObjectMetadataItems } from '@/navigation-menu-item/common/hooks/useNavigationObjectMetadataItems';
import { viewSummariesSelector } from '@/views/states/selectors/viewSummariesSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

import { useNavigationMenuItemsData } from './useNavigationMenuItemsData';

export const useSortedNavigationMenuItems = () => {
  const { navigationMenuItems, workspaceNavigationMenuItems } =
    useNavigationMenuItemsData();
  const viewSummaries = useAtomStateValue(viewSummariesSelector);
  const objectMetadataItems = useNavigationObjectMetadataItems();

  const navigationMenuItemsSorted = useMemo(() => {
    return filterAndSortNavigationMenuItems(
      navigationMenuItems,
      viewSummaries,
      objectMetadataItems,
    );
  }, [navigationMenuItems, viewSummaries, objectMetadataItems]);

  const workspaceNavigationMenuItemsSorted = useMemo(() => {
    return filterAndSortNavigationMenuItems(
      workspaceNavigationMenuItems,
      viewSummaries,
      objectMetadataItems,
    );
  }, [workspaceNavigationMenuItems, viewSummaries, objectMetadataItems]);

  return {
    navigationMenuItemsSorted,
    workspaceNavigationMenuItemsSorted,
  };
};
