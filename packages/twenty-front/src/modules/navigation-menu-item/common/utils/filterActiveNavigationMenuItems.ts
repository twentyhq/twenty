import { isDefined } from 'twenty-shared/utils';

import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const filterActiveNavigationMenuItems = <
  TNavigationMenuItem extends Pick<NavigationMenuItem, 'id' | 'parentId'> & {
    isActive?: boolean;
  },
>(
  navigationMenuItems: TNavigationMenuItem[],
): TNavigationMenuItem[] => {
  const navigationMenuItemById = new Map(
    navigationMenuItems.map((navigationMenuItem) => [
      navigationMenuItem.id,
      navigationMenuItem,
    ]),
  );

  const isActiveWithAncestors = ({
    navigationMenuItem,
    visitedIds,
  }: {
    navigationMenuItem: TNavigationMenuItem;
    visitedIds: Set<string>;
  }): boolean => {
    if (navigationMenuItem.isActive === false) {
      return false;
    }

    if (
      !isDefined(navigationMenuItem.parentId) ||
      visitedIds.has(navigationMenuItem.parentId)
    ) {
      return true;
    }

    const parent = navigationMenuItemById.get(navigationMenuItem.parentId);

    if (!isDefined(parent)) {
      return true;
    }

    visitedIds.add(navigationMenuItem.id);

    return isActiveWithAncestors({ navigationMenuItem: parent, visitedIds });
  };

  return navigationMenuItems.filter((navigationMenuItem) =>
    isActiveWithAncestors({ navigationMenuItem, visitedIds: new Set() }),
  );
};
