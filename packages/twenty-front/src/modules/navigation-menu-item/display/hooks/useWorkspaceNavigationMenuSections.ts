import { isNavigationMenuItemSection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemSection';
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

  return workspaceNavigationMenuItems
    .filter(
      (item) =>
        isNavigationMenuItemSection(item) &&
        (item.parentId ?? null) === containerId,
    )
    .sort((a, b) => a.position - b.position);
};
