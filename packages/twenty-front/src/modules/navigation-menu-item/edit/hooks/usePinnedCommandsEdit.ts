import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { commandMenuItemsSelector } from '@/command-menu-item/states/commandMenuItemsSelector';
import { navigationMenuItemsWithHiddenSelector } from '@/navigation-menu-item/common/states/navigationMenuItemsWithHiddenSelector';
import { filterWorkspaceNavigationMenuItems } from '@/navigation-menu-item/common/utils/filterWorkspaceNavigationMenuItems';
import { getNavigationMenuItemMovedPosition } from '@/navigation-menu-item/common/utils/getNavigationMenuItemMovedPosition';
import { getPinnedCommands } from '@/navigation-menu-item/display/command/utils/getPinnedCommands';
import { useNavigationMenuItemEditController } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';
import { useRestoreHiddenNavigationMenuItem } from '@/navigation-menu-item/edit/hooks/useRestoreHiddenNavigationMenuItem';
import { findRestorablePinnedCommandNavigationMenuItem } from '@/navigation-menu-item/edit/utils/findRestorablePinnedCommandNavigationMenuItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const usePinnedCommandsEdit = () => {
  const { currentItems, createItem, updateItem, deleteItems } =
    useNavigationMenuItemEditController('workspace');
  const { restoreHiddenNavigationMenuItem } =
    useRestoreHiddenNavigationMenuItem();
  const navigationMenuItemsWithHidden = useAtomStateValue(
    navigationMenuItemsWithHiddenSelector,
  );
  const commandMenuItems = useAtomStateValue(commandMenuItemsSelector);

  const pinnedCommands = getPinnedCommands({
    navigationMenuItems: currentItems,
    commandMenuItems,
  });
  const pinnedCommandSiblings = pinnedCommands.flatMap(
    ({ navigationMenuItemId }) =>
      currentItems.filter(({ id }) => id === navigationMenuItemId),
  );

  const getMovedPosition = (navigationMenuItemId: string, offset: -1 | 1) =>
    getNavigationMenuItemMovedPosition({
      siblings: pinnedCommandSiblings,
      itemId: navigationMenuItemId,
      offset,
    });

  const move = (navigationMenuItemId: string, offset: -1 | 1) => {
    const position = getMovedPosition(navigationMenuItemId, offset);

    if (isDefined(position)) {
      void updateItem(navigationMenuItemId, { position });
    }
  };

  const isPinned = (commandMenuItemId: string) =>
    pinnedCommands.some(
      ({ commandMenuItem }) => commandMenuItem.id === commandMenuItemId,
    );

  const pin = (commandMenuItemId: string) => {
    if (isPinned(commandMenuItemId)) {
      return;
    }

    const restorablePinnedCommand =
      findRestorablePinnedCommandNavigationMenuItem({
        savedWorkspaceNavigationMenuItems: filterWorkspaceNavigationMenuItems(
          navigationMenuItemsWithHidden,
        ),
        draftNavigationMenuItems: currentItems,
        commandMenuItemId,
      });

    if (isDefined(restorablePinnedCommand)) {
      restoreHiddenNavigationMenuItem({
        navigationMenuItemId: restorablePinnedCommand.id,
        fallbackParentId: null,
      });
      return;
    }

    createItem({ type: NavigationMenuItemType.COMMAND, commandMenuItemId });
  };

  return {
    canMove: (navigationMenuItemId: string, offset: -1 | 1) =>
      isDefined(getMovedPosition(navigationMenuItemId, offset)),
    moveUp: (navigationMenuItemId: string) => move(navigationMenuItemId, -1),
    moveDown: (navigationMenuItemId: string) => move(navigationMenuItemId, 1),
    remove: (navigationMenuItemId: string) =>
      void deleteItems([navigationMenuItemId]),
    isPinned,
    pin,
  };
};
