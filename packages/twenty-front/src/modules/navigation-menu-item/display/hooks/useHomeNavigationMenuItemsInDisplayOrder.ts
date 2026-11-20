import { NavigationMenuItemType } from 'twenty-shared/types';

import { useNavigationObjectMetadataItems } from '@/navigation-menu-item/common/hooks/useNavigationObjectMetadataItems';
import { flattenNavigationMenuItemsWithFolderChildren } from '@/navigation-menu-item/common/utils/flattenNavigationMenuItemsWithFolderChildren';
import { getNavigationMenuContainersInDisplayOrder } from '@/navigation-menu-item/common/utils/getNavigationMenuContainersInDisplayOrder';
import { useNavigationMenuItemsByFolder } from '@/navigation-menu-item/display/folder/hooks/useNavigationMenuItemsByFolder';
import { useNavigationMenuItemSectionItems } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemSectionItems';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { useSortedNavigationMenuItems } from '@/navigation-menu-item/display/hooks/useSortedNavigationMenuItems';
import { getWorkspaceSidebarOrphanItemsInDisplayOrder } from '@/navigation-menu-item/display/utils/getWorkspaceSidebarOrphanItemsInDisplayOrder';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  FeatureFlagKey,
  type NavigationMenuItem,
} from '~/generated-metadata/graphql';

export const useHomeNavigationMenuItemsInDisplayOrder =
  (): NavigationMenuItem[] => {
    const isCustomizableSidebarEnabled = useIsFeatureEnabled(
      FeatureFlagKey.IS_CUSTOMIZABLE_SIDEBAR_ENABLED,
    );
    const rootNavigationMenuItems = useNavigationMenuItemSectionItems({
      shouldFlattenTopLevelSections: true,
    });
    const { workspaceNavigationMenuItems } = useNavigationMenuItemsData();
    const { workspaceNavigationMenuItemsSorted } =
      useSortedNavigationMenuItems();
    const { workspaceNavigationMenuItemsByFolder } =
      useNavigationMenuItemsByFolder();
    const views = useAtomStateValue(viewsSelector);
    const objectMetadataItems = useNavigationObjectMetadataItems();
    const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

    if (!isCustomizableSidebarEnabled) {
      return rootNavigationMenuItems;
    }

    const homeSectionIds = getNavigationMenuContainersInDisplayOrder({
      navigationMenuItems: workspaceNavigationMenuItems,
      type: NavigationMenuItemType.SECTION,
      containerId: null,
    }).map((section) => section.id);

    return [null, ...homeSectionIds].flatMap((containerId) =>
      flattenNavigationMenuItemsWithFolderChildren(
        getWorkspaceSidebarOrphanItemsInDisplayOrder({
          workspaceNavigationMenuItems,
          workspaceNavigationMenuItemsSorted,
          objectMetadataItems,
          views,
          objectPermissionsByObjectMetadataId,
          containerId,
        }),
        workspaceNavigationMenuItemsByFolder,
      ),
    );
  };
