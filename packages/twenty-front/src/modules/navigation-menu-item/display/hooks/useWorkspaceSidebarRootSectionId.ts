import { getWorkspaceSidebarRootSectionId } from '@/navigation-menu-item/common/utils/getWorkspaceSidebarRootSectionId';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';

// TODO(@thomtrp): remove once IS_CUSTOMIZABLE_SIDEBAR_ENABLED is on for every workspace
export const useWorkspaceSidebarRootSectionId = (): string | null => {
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsData();

  return getWorkspaceSidebarRootSectionId(workspaceNavigationMenuItems);
};
