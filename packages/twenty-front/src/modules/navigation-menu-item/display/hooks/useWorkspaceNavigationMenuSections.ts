import { getNavigationMenuSectionsInContainer } from '@/navigation-menu-item/common/utils/getNavigationMenuSectionsInContainer';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  FeatureFlagKey,
  type NavigationMenuItem,
} from '~/generated-metadata/graphql';

export const useWorkspaceNavigationMenuSections = (
  containerId: string | null,
): NavigationMenuItem[] => {
  const isCustomizableSidebarEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CUSTOMIZABLE_SIDEBAR_ENABLED,
  );
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsData();

  if (!isCustomizableSidebarEnabled) {
    return [];
  }

  return getNavigationMenuSectionsInContainer({
    navigationMenuItems: workspaceNavigationMenuItems,
    containerId,
  });
};
