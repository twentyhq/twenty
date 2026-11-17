import { getNavigationMenuTabsInDisplayOrder } from '@/navigation-menu-item/common/utils/getNavigationMenuTabsInDisplayOrder';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useWorkspaceNavigationMenuTabs = () => {
  const isCustomizableSidebarEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CUSTOMIZABLE_SIDEBAR_ENABLED,
  );
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsData();

  if (!isCustomizableSidebarEnabled) {
    return [];
  }

  return getNavigationMenuTabsInDisplayOrder(workspaceNavigationMenuItems);
};
