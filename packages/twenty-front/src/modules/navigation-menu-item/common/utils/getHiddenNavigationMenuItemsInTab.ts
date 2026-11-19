import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { filterActiveNavigationMenuItems } from '@/navigation-menu-item/common/utils/filterActiveNavigationMenuItems';
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
  const activeNavigationMenuItemById = new Map(
    filterActiveNavigationMenuItems(navigationMenuItems).map(
      (navigationMenuItem) => [navigationMenuItem.id, navigationMenuItem],
    ),
  );

  const getTabId = (navigationMenuItem: TNavigationMenuItem) => {
    let parent = isDefined(navigationMenuItem.parentId)
      ? activeNavigationMenuItemById.get(navigationMenuItem.parentId)
      : undefined;

    while (isDefined(parent) && parent.type !== NavigationMenuItemType.TAB) {
      parent = isDefined(parent.parentId)
        ? activeNavigationMenuItemById.get(parent.parentId)
        : undefined;
    }

    return parent?.id ?? null;
  };

  return navigationMenuItems.filter(
    (navigationMenuItem) =>
      navigationMenuItem.isActive === false &&
      !excludedIds.has(navigationMenuItem.id) &&
      (!isDefined(navigationMenuItem.parentId) ||
        activeNavigationMenuItemById.has(navigationMenuItem.parentId)) &&
      getTabId(navigationMenuItem) === tabId,
  );
};
