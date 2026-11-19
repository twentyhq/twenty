import { applicationsSelector } from '@/applications/states/applicationsSelector';
import { isTwentyStandardApplication } from '@/applications/utils/isTwentyStandardApplication';
import { getWorkspaceSidebarRootSectionId } from '@/navigation-menu-item/common/utils/getWorkspaceSidebarRootSectionId';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useWorkspaceSidebarRootSectionId = (): string | null => {
  const applications = useAtomStateValue(applicationsSelector);
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsData();

  return getWorkspaceSidebarRootSectionId({
    navigationMenuItems: workspaceNavigationMenuItems,
    standardApplicationId: applications.find(isTwentyStandardApplication)?.id,
  });
};
