import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useNavigationObjectMetadataItems } from '@/navigation-menu-item/common/hooks/useNavigationObjectMetadataItems';
import { flattenNavigationMenuItemsWithFolderChildren } from '@/navigation-menu-item/common/utils/flattenNavigationMenuItemsWithFolderChildren';
import { getWorkspaceSidebarOrphanItemsInDisplayOrder } from '@/navigation-menu-item/display/utils/getWorkspaceSidebarOrphanItemsInDisplayOrder';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useNavigationMenuItemsByFolder } from '@/navigation-menu-item/display/folder/hooks/useNavigationMenuItemsByFolder';
import { useNavigationMenuItemsData } from './useNavigationMenuItemsData';
import { useSortedNavigationMenuItems } from './useSortedNavigationMenuItems';

export type NavigationMenuItemClickParams = {
  item: NavigationMenuItem;
  objectMetadataItem?: EnrichedObjectMetadataItem | null;
};

export const useNavigationMenuItemSectionItems = (
  containerId: string | null = null,
): NavigationMenuItem[] => {
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsData();
  const { workspaceNavigationMenuItemsSorted } = useSortedNavigationMenuItems();
  const { workspaceNavigationMenuItemsByFolder } =
    useNavigationMenuItemsByFolder();
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const views = useAtomStateValue(viewsSelector);
  const objectMetadataItems = useNavigationObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const isCustomizableSidebarEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CUSTOMIZABLE_SIDEBAR_ENABLED,
  );

  const flattenedSectionIds = new Set(
    !isCustomizableSidebarEnabled && containerId === null
      ? workspaceNavigationMenuItems
          .filter(
            (item) =>
              item.type === NavigationMenuItemType.SECTION &&
              !isDefined(item.parentId),
          )
          .map((item) => item.id)
      : [],
  );

  const flatItems = getWorkspaceSidebarOrphanItemsInDisplayOrder({
    workspaceNavigationMenuItems,
    workspaceNavigationMenuItemsSorted,
    objectMetadataItems,
    views,
    objectPermissionsByObjectMetadataId,
    includeInaccessibleObjectBackedItems: isLayoutCustomizationModeEnabled,
    containerId,
    flattenedSectionIds,
  });

  return flattenNavigationMenuItemsWithFolderChildren(
    flatItems,
    workspaceNavigationMenuItemsByFolder,
  );
};
