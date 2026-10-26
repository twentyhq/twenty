import { isDefined } from 'twenty-shared/utils';

import { isNavigationMenuItemCommandsContainer } from '@/navigation-menu-item/common/utils/isNavigationMenuItemCommandsContainer';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { useNavigationMenuItemsInContainers } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsInContainers';

export const useNavigationMenuItemCommands = (parentId: string | null) => {
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsData();
  const commandsContainer = workspaceNavigationMenuItems.find(
    (item) =>
      isNavigationMenuItemCommandsContainer(item) &&
      (item.folderId ?? null) === parentId,
  );
  const commandItems = useNavigationMenuItemsInContainers(
    isDefined(commandsContainer) ? [commandsContainer.id] : [],
  );

  return { commandsContainer, commandItems };
};
