import { getWorkspaceSidebarRootSectionId } from '@/navigation-menu-item/common/utils/getWorkspaceSidebarRootSectionId';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useWorkspaceSidebarRootContainerId = (): string | null => {
  const isCustomizableSidebarEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CUSTOMIZABLE_SIDEBAR_ENABLED,
  );
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsData();

  return isCustomizableSidebarEnabled
    ? null
    : getWorkspaceSidebarRootSectionId(workspaceNavigationMenuItems);
};
