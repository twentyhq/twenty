import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const findRestorablePinnedCommandNavigationMenuItem = ({
  savedWorkspaceNavigationMenuItems,
  draftNavigationMenuItems,
  commandMenuItemId,
}: {
  savedWorkspaceNavigationMenuItems: NavigationMenuItem[];
  draftNavigationMenuItems: Pick<NavigationMenuItem, 'id'>[];
  commandMenuItemId: string;
}): NavigationMenuItem | undefined => {
  const draftNavigationMenuItemIds = new Set(
    draftNavigationMenuItems.map(({ id }) => id),
  );

  return savedWorkspaceNavigationMenuItems.find(
    (navigationMenuItem) =>
      navigationMenuItem.type === NavigationMenuItemType.COMMAND &&
      navigationMenuItem.commandMenuItemId === commandMenuItemId &&
      !isDefined(navigationMenuItem.parentId) &&
      !draftNavigationMenuItemIds.has(navigationMenuItem.id),
  );
};
