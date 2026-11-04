import {
  type NavigationMenuItemCommandKey,
  NavigationMenuItemType,
} from 'twenty-shared/types';

import { isNavigationMenuItemPinnedCommands } from '@/navigation-menu-item/common/utils/isNavigationMenuItemPinnedCommands';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { useNavigationMenuItemEditController } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';

export const usePinNavigationMenuCommand = () => {
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsData();
  const { createItem } = useNavigationMenuItemEditController('workspace');

  const pinCommand = (commandKey: NavigationMenuItemCommandKey) => {
    const pinnedCommandsContainerId =
      workspaceNavigationMenuItems.find(isNavigationMenuItemPinnedCommands)
        ?.id ?? createItem({ type: NavigationMenuItemType.PINNED_COMMANDS });

    createItem(
      { type: NavigationMenuItemType.COMMAND, commandKey },
      { targetFolderId: pinnedCommandsContainerId },
    );
  };

  return { pinCommand };
};
