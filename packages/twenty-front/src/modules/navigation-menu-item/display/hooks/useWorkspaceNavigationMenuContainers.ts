import { NavigationMenuItemType } from 'twenty-shared/types';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { getNavigationMenuContainersInDisplayOrder } from '@/navigation-menu-item/common/utils/getNavigationMenuContainersInDisplayOrder';
import { useIsNavigationMenuItemReadable } from '@/navigation-menu-item/display/hooks/useIsNavigationMenuItemReadable';
import { useNavigationMenuBuiltInSectionAvailability } from '@/navigation-menu-item/display/hooks/useNavigationMenuBuiltInSectionAvailability';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { hasNavigationMenuContainerVisibleContent } from '@/navigation-menu-item/display/utils/hasNavigationMenuContainerVisibleContent';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  FeatureFlagKey,
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
  const { isBuiltInSectionAvailable } =
    useNavigationMenuBuiltInSectionAvailability();
  const isItemReadable = useIsNavigationMenuItemReadable();
  const hasLayoutsPermission = useHasPermissionFlag(PermissionFlagType.LAYOUTS);
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

  return containers.filter((tab) => {
    const isEmptyTab = !hasNavigationMenuContainerVisibleContent({
      containerId: tab.id,
      navigationMenuItems: workspaceNavigationMenuItems,
      isItemReadable: () => true,
      isBuiltInSectionAvailable: () => true,
    });

    if (isEmptyTab) {
      return hasLayoutsPermission;
    }

    return hasNavigationMenuContainerVisibleContent({
      containerId: tab.id,
      navigationMenuItems: workspaceNavigationMenuItems,
      isItemReadable,
      isBuiltInSectionAvailable,
    });
  });
};
