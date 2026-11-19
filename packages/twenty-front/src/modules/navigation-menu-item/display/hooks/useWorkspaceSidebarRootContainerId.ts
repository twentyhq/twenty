import { useWorkspaceSidebarRootSectionId } from '@/navigation-menu-item/display/hooks/useWorkspaceSidebarRootSectionId';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

// TODO(@thomtrp): remove once IS_CUSTOMIZABLE_SIDEBAR_ENABLED is on for every workspace
export const useWorkspaceSidebarRootContainerId = (): string | null => {
  const isCustomizableSidebarEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CUSTOMIZABLE_SIDEBAR_ENABLED,
  );
  const workspaceSidebarRootSectionId = useWorkspaceSidebarRootSectionId();

  return isCustomizableSidebarEnabled ? null : workspaceSidebarRootSectionId;
};
