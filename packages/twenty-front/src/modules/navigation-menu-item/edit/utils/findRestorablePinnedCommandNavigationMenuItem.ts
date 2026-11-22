import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const findRestorablePinnedCommandNavigationMenuItem = <
  TNavigationMenuItem extends Pick<
    NavigationMenuItem,
    'id' | 'type' | 'commandMenuItemId' | 'parentId'
  >,
>({
  savedWorkspaceNavigationMenuItems,
  draftNavigationMenuItems,
  commandMenuItemId,
}: {
  savedWorkspaceNavigationMenuItems: TNavigationMenuItem[];
  draftNavigationMenuItems: Pick<NavigationMenuItem, 'id'>[];
  commandMenuItemId: string;
}): TNavigationMenuItem | undefined => {
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
