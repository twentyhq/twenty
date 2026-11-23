import { NavigationMenuItemType } from 'twenty-shared/types';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { getNavigationMenuContainersInDisplayOrder } from '@/navigation-menu-item/common/utils/getNavigationMenuContainersInDisplayOrder';
import { isNavigationMenuTabWithOnlyUnavailableSections } from '@/navigation-menu-item/common/utils/isNavigationMenuTabWithOnlyUnavailableSections';
import { useNavigationMenuBuiltInSectionAvailability } from '@/navigation-menu-item/display/hooks/useNavigationMenuBuiltInSectionAvailability';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

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

  return containers.filter(
    (tab) =>
      !isNavigationMenuTabWithOnlyUnavailableSections({
        tabId: tab.id,
        navigationMenuItems: workspaceNavigationMenuItems,
        isBuiltInSectionAvailable,
      }),
  );
};
