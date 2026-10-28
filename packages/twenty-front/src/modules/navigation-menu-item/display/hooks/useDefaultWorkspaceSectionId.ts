import { NavigationMenuItemType } from 'twenty-shared/types';

import { useWorkspaceNavigationMenuSections } from '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuSections';

export const useDefaultWorkspaceSectionId = () =>
  useWorkspaceNavigationMenuSections(null).find(
    (section) => section.type === NavigationMenuItemType.SECTION,
  )?.id ?? null;
