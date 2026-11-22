import { NavigationMenuItemType } from 'twenty-shared/types';

import { sortNavigationMenuContainerChildren } from '@/navigation-menu-item/common/utils/sortNavigationMenuContainerChildren';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getNavigationMenuContainerChildrenInPositionOrder = <
  TItem extends Pick<NavigationMenuItem, 'parentId' | 'type' | 'position'>,
>({
  items,
  containerId,
}: {
  items: TItem[];
  containerId: string | null;
}): TItem[] => {
  const children = items.filter(
    (item) =>
      (item.parentId ?? null) === containerId &&
      item.type !== NavigationMenuItemType.TAB,
  );

  return sortNavigationMenuContainerChildren({
    items: children.filter(
      (child) => child.type !== NavigationMenuItemType.SECTION,
    ),
    sections: children.filter(
      (child) => child.type === NavigationMenuItemType.SECTION,
    ),
  });
};
