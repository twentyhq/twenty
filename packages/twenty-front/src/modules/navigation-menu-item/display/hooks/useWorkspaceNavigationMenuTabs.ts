import {
  FeatureFlagKey,
  type NavigationMenuItem,
} from '~/generated-metadata/graphql';

import { isNavigationMenuItemTab } from '@/navigation-menu-item/common/utils/isNavigationMenuItemTab';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

export const useWorkspaceNavigationMenuTabs = (): NavigationMenuItem[] => {
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsData();
  const isCustomizableSidebarEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CUSTOMIZABLE_SIDEBAR_ENABLED,
  );

  if (!isCustomizableSidebarEnabled) {
    return [];
  }

  return workspaceNavigationMenuItems
    .filter(isNavigationMenuItemTab)
    .sort((a, b) => a.position - b.position);
};
