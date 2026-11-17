import { isNavigationMenuItemTab } from '@/navigation-menu-item/common/utils/isNavigationMenuItemTab';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  FeatureFlagKey,
  type NavigationMenuItem,
} from '~/generated-metadata/graphql';

export const useWorkspaceNavigationMenuTabs = (): NavigationMenuItem[] => {
  const isCustomizableSidebarEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CUSTOMIZABLE_SIDEBAR_ENABLED,
  );
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsData();

  if (!isCustomizableSidebarEnabled) {
    return [];
  }

  return workspaceNavigationMenuItems
    .filter(isNavigationMenuItemTab)
    .sort((a, b) => a.position - b.position);
};
