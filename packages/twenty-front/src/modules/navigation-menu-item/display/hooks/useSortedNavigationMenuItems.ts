import { useMemo } from 'react';

import { filterAndSortNavigationMenuItems } from '@/navigation-menu-item/common/utils/filterAndSortNavigationMenuItems';
import { useNavigationObjectMetadataItems } from '@/navigation-menu-item/common/hooks/useNavigationObjectMetadataItems';
import { useIsWorkflowCoreEnabled } from '@/workflow/hooks/useIsWorkflowCoreEnabled';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

import { useNavigationMenuItemsData } from './useNavigationMenuItemsData';

export const useSortedNavigationMenuItems = () => {
  const { navigationMenuItems, workspaceNavigationMenuItems } =
    useNavigationMenuItemsData();
  const views = useAtomStateValue(viewsSelector);
  const objectMetadataItems = useNavigationObjectMetadataItems();
  const isWorkflowCoreEnabled = useIsWorkflowCoreEnabled();

  const navigationMenuItemsSorted = useMemo(() => {
    return filterAndSortNavigationMenuItems(
      navigationMenuItems,
      views,
      objectMetadataItems,
      isWorkflowCoreEnabled,
    );
  }, [navigationMenuItems, views, objectMetadataItems, isWorkflowCoreEnabled]);

  const workspaceNavigationMenuItemsSorted = useMemo(() => {
    return filterAndSortNavigationMenuItems(
      workspaceNavigationMenuItems,
      views,
      objectMetadataItems,
      isWorkflowCoreEnabled,
    );
  }, [
    workspaceNavigationMenuItems,
    views,
    objectMetadataItems,
    isWorkflowCoreEnabled,
  ]);

  return {
    navigationMenuItemsSorted,
    workspaceNavigationMenuItemsSorted,
  };
};
