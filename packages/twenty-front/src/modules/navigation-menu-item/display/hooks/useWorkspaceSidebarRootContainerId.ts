import { useWorkspaceSidebarRootSectionId } from '@/navigation-menu-item/display/hooks/useWorkspaceSidebarRootSectionId';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

// Temporary: the legacy sidebar (flag off) has no sections, so it uses the standard
// Workspace section as its root. Remove with IS_CUSTOMIZABLE_SIDEBAR_ENABLED.
export const useWorkspaceSidebarRootContainerId = (): string | null => {
  const isCustomizableSidebarEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CUSTOMIZABLE_SIDEBAR_ENABLED,
  );
  const workspaceSidebarRootSectionId = useWorkspaceSidebarRootSectionId();

  return isCustomizableSidebarEnabled ? null : workspaceSidebarRootSectionId;
};
