import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type NavigationMenuItem } from '~/generated-metadata/graphql';

type HiddenNavigationMenuItemCandidate = Pick<
  NavigationMenuItem,
  'id' | 'parentId' | 'type'
> & {
  isActive?: boolean;
};

export const getHiddenNavigationMenuItemsInTab = <
  TNavigationMenuItem extends HiddenNavigationMenuItemCandidate,
>({
  navigationMenuItems,
  excludedIds,
  tabId,
}: {
  navigationMenuItems: TNavigationMenuItem[];
  excludedIds: Set<string>;
  tabId: string | null;
}): TNavigationMenuItem[] => {
  const navigationMenuItemById = new Map(
    navigationMenuItems.map((navigationMenuItem) => [
      navigationMenuItem.id,
      navigationMenuItem,
    ]),
  );

  const getAncestors = (navigationMenuItem: TNavigationMenuItem) => {
    const ancestors: TNavigationMenuItem[] = [];
    const visitedIds = new Set([navigationMenuItem.id]);
    let parent = isDefined(navigationMenuItem.parentId)
      ? navigationMenuItemById.get(navigationMenuItem.parentId)
      : undefined;

    while (isDefined(parent) && !visitedIds.has(parent.id)) {
      ancestors.push(parent);
      visitedIds.add(parent.id);
      parent = isDefined(parent.parentId)
        ? navigationMenuItemById.get(parent.parentId)
        : undefined;
    }

    return ancestors;
  };

  return navigationMenuItems.filter((navigationMenuItem) => {
    if (
      navigationMenuItem.isActive !== false ||
      navigationMenuItem.type === NavigationMenuItemType.TAB ||
      excludedIds.has(navigationMenuItem.id)
    ) {
      return false;
    }

    const ancestors = getAncestors(navigationMenuItem);

    if (ancestors.some((ancestor) => ancestor.isActive === false)) {
      return false;
    }

    const tabAncestor = ancestors.find(
      (ancestor) => ancestor.type === NavigationMenuItemType.TAB,
    );

    return (tabAncestor?.id ?? null) === tabId;
  });
};
