import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useIsMobile } from 'twenty-ui/utilities';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { getNavigationMenuContainersInDisplayOrder } from '@/navigation-menu-item/common/utils/getNavigationMenuContainersInDisplayOrder';
import { useIsNavigationMenuItemReadable } from '@/navigation-menu-item/display/hooks/useIsNavigationMenuItemReadable';
import { useNavigationMenuBuiltInSectionAvailability } from '@/navigation-menu-item/display/hooks/useNavigationMenuBuiltInSectionAvailability';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { useSortedNavigationMenuItems } from '@/navigation-menu-item/display/hooks/useSortedNavigationMenuItems';
import { hasNavigationMenuContainerVisibleContent } from '@/navigation-menu-item/display/utils/hasNavigationMenuContainerVisibleContent';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  FeatureFlagKey,
  type NavigationMenuItem,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

export const useWorkspaceNavigationMenuContainers = ({
  type,
  containerId,
}: {
  type: NavigationMenuItemType.TAB | NavigationMenuItemType.SECTION;
  containerId: string | null;
}) => {
  const isCustomizableSidebarEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CUSTOMIZABLE_SIDEBAR_ENABLED,
  );
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsData();
  const { navigationMenuItemsSorted, workspaceNavigationMenuItemsSorted } =
    useSortedNavigationMenuItems();
  const { isBuiltInSectionAvailable } =
    useNavigationMenuBuiltInSectionAvailability();
  const isItemReadable = useIsNavigationMenuItemReadable();
  const hasLayoutsPermission = useHasPermissionFlag(PermissionFlagType.LAYOUTS);
  const isMobile = useIsMobile();
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );

  if (!isCustomizableSidebarEnabled) {
    return [];
  }

  const containers = getNavigationMenuContainersInDisplayOrder({
    navigationMenuItems: workspaceNavigationMenuItems,
    type,
    containerId,
  });

  if (type !== NavigationMenuItemType.TAB || isLayoutCustomizationModeEnabled) {
    return containers;
  }

  const displayableItemIds = new Set(
    workspaceNavigationMenuItemsSorted.map((item) => item.id),
  );
  const hasFavorites = navigationMenuItemsSorted.some(
    (item) => !isDefined(item.parentId),
  );

  const isItemDisplayed = (item: NavigationMenuItem) =>
    displayableItemIds.has(item.id) && isItemReadable(item);

  const isBuiltInSectionDisplayed = (
    builtInSectionKey: string | null | undefined,
  ) =>
    builtInSectionKey === 'favorites'
      ? hasFavorites
      : isBuiltInSectionAvailable(builtInSectionKey);

  const canSeeTabsWithoutItems = hasLayoutsPermission && !isMobile;

  return containers.filter((tab) => {
    const hasNoItemsForAnyViewer = !hasNavigationMenuContainerVisibleContent({
      containerId: tab.id,
      navigationMenuItems: workspaceNavigationMenuItems,
      isItemReadable: () => true,
      isBuiltInSectionAvailable: () => true,
    });

    if (hasNoItemsForAnyViewer) {
      return canSeeTabsWithoutItems;
    }

    return hasNavigationMenuContainerVisibleContent({
      containerId: tab.id,
      navigationMenuItems: workspaceNavigationMenuItems,
      isItemReadable: isItemDisplayed,
      isBuiltInSectionAvailable: isBuiltInSectionDisplayed,
    });
  });
};
