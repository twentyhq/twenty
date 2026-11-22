import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { navigationMenuItemsWithHiddenSelector } from '@/navigation-menu-item/common/states/navigationMenuItemsWithHiddenSelector';
import { filterWorkspaceNavigationMenuItems } from '@/navigation-menu-item/common/utils/filterWorkspaceNavigationMenuItems';
import { getNavigationMenuItemMovedPosition } from '@/navigation-menu-item/common/utils/getNavigationMenuItemMovedPosition';
import { getPinnedCommandNavigationMenuItems } from '@/navigation-menu-item/display/command/utils/getPinnedCommandNavigationMenuItems';
import { useNavigationMenuItemEditController } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';
import { useRestoreHiddenNavigationMenuItem } from '@/navigation-menu-item/edit/hooks/useRestoreHiddenNavigationMenuItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const usePinnedCommandsEdit = () => {
  const { currentItems, createItem, updateItem, deleteItems } =
    useNavigationMenuItemEditController('workspace');
  const { restoreHiddenNavigationMenuItem } =
    useRestoreHiddenNavigationMenuItem();
  const navigationMenuItemsWithHidden = useAtomStateValue(
    navigationMenuItemsWithHiddenSelector,
  );

  const pinnedCommandNavigationMenuItems =
    getPinnedCommandNavigationMenuItems(currentItems);

  const getMovedPosition = (navigationMenuItemId: string, offset: -1 | 1) =>
    getNavigationMenuItemMovedPosition({
      siblings: pinnedCommandNavigationMenuItems,
      itemId: navigationMenuItemId,
      offset,
    });

  const move = (navigationMenuItemId: string, offset: -1 | 1) => {
    const position = getMovedPosition(navigationMenuItemId, offset);

    if (isDefined(position)) {
      void updateItem(navigationMenuItemId, { position });
    }
  };

  const remove = (navigationMenuItemId: string) =>
    void deleteItems([navigationMenuItemId]);

  const isPinned = (commandMenuItemId: string) =>
    pinnedCommandNavigationMenuItems.some(
      (navigationMenuItem) =>
        navigationMenuItem.commandMenuItemId === commandMenuItemId,
    );

  const pin = (commandMenuItemId: string) => {
    const currentItemIds = new Set(currentItems.map(({ id }) => id));
    const hiddenPinnedCommand = filterWorkspaceNavigationMenuItems(
      navigationMenuItemsWithHidden,
    ).find(
      (navigationMenuItem) =>
        navigationMenuItem.type === NavigationMenuItemType.COMMAND &&
        navigationMenuItem.commandMenuItemId === commandMenuItemId &&
        !currentItemIds.has(navigationMenuItem.id),
    );

    if (isDefined(hiddenPinnedCommand)) {
      restoreHiddenNavigationMenuItem({
        navigationMenuItemId: hiddenPinnedCommand.id,
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
    remove,
    isPinned,
    pin,
  };
};
