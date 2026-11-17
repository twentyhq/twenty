import { type NavigationMenuItemType } from 'twenty-shared/types';

import { getNavigationMenuContainersInDisplayOrder } from '@/navigation-menu-item/common/utils/getNavigationMenuContainersInDisplayOrder';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
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

  if (!isCustomizableSidebarEnabled) {
    return [];
  }

  return getNavigationMenuContainersInDisplayOrder({
    navigationMenuItems: workspaceNavigationMenuItems,
    type,
    containerId,
  });
};
